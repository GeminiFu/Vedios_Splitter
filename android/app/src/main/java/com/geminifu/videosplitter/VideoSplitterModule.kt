package com.geminifu.videosplitter

import android.media.*
import android.net.Uri
import com.facebook.react.bridge.*
import java.io.File
import com.facebook.react.modules.core.DeviceEventManagerModule

class VideoSplitterModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "VideoSplitterModule"

    @ReactMethod
    fun getVideoDuration(uriString: String, promise: Promise) {
        try {
            val retriever = MediaMetadataRetriever()
            retriever.setDataSource(reactContext, Uri.parse(uriString))
            val duration = retriever.extractMetadata(
                MediaMetadataRetriever.METADATA_KEY_DURATION
            )?.toLong() ?: 0L
            retriever.release()
            promise.resolve((duration / 1000.0))
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun splitVideo(
        uriString: String,
        segmentDuration: Int,
        outputDir: String,
        prefix: String,
        promise: Promise
    ) {
        Thread {
            try {
                val retriever = MediaMetadataRetriever()
                retriever.setDataSource(reactContext, Uri.parse(uriString))
                val totalDurationMs = retriever.extractMetadata(
                    MediaMetadataRetriever.METADATA_KEY_DURATION
                )?.toLong() ?: 0L
                retriever.release()

                val segmentDurationMs = segmentDuration * 1000L
                val segmentCount = Math.ceil(totalDurationMs.toDouble() / segmentDurationMs).toInt()
                val results = Arguments.createArray()

                val retriever2 = MediaMetadataRetriever()
                retriever2.setDataSource(reactContext, Uri.parse(uriString))
                val rotation = retriever2.extractMetadata(
                    MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION
                )?.toIntOrNull() ?: 0
                retriever2.release()

                var videoFrameDurationUs = 33334L   // ← 宣告在這裡（for 迴圈外）

                val fd = reactContext.contentResolver.openFileDescriptor(
                    Uri.parse(uriString), "r"
                ) ?: throw Exception("Cannot open file")

                for (i in 0 until segmentCount) {
                    val startMs = i * segmentDurationMs
                    val endMs = minOf(startMs + segmentDurationMs, totalDurationMs)
                    val fileName = "${prefix}_${String.format("%02d", i + 1)}.mp4"
                    val outputFile = File(outputDir, fileName)

                    val extractor = MediaExtractor()
                    extractor.setDataSource(fd.fileDescriptor)

                    val muxer = MediaMuxer(
                        outputFile.absolutePath,
                        MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4
                    )

                    val trackIndexMap = mutableMapOf<Int, Int>()
                    for (t in 0 until extractor.trackCount) {
                        val format = extractor.getTrackFormat(t)
                        val mime = format.getString(MediaFormat.KEY_MIME) ?: ""
                        
                        if (mime.startsWith("video/") && format.containsKey(MediaFormat.KEY_FRAME_RATE)) {
                            val fps = format.getInteger(MediaFormat.KEY_FRAME_RATE)
                            if (fps > 0) videoFrameDurationUs = 1_000_000L / fps
                        }

                        // ── 驗證用 log ──
                        if (mime.startsWith("video/")) {
                            val fps = if (format.containsKey(MediaFormat.KEY_FRAME_RATE))
                                format.getInteger(MediaFormat.KEY_FRAME_RATE) else -1
                            android.util.Log.d("SplitDebug", "video mime=$mime fps=$fps")
                            android.util.Log.d("SplitDebug", "一幀時長(ms)=${if (fps > 0) 1000.0 / fps else -1.0}")
                        }
                        // ────────────
                        
                        if (mime.startsWith("video/") || mime.startsWith("audio/")) {
                            val muxerTrack = muxer.addTrack(format)
                            trackIndexMap[t] = muxerTrack
                            extractor.selectTrack(t)
                        }
                    }

                    // 取得原始影片旋轉角度
                    muxer.setOrientationHint(rotation)

                    muxer.start()
                    extractor.seekTo(startMs * 1000, MediaExtractor.SEEK_TO_CLOSEST_SYNC)

                    // 取得 seek 後的實際起點，作為時間戳基準
                    val actualStartUs = extractor.sampleTime
                    if (actualStartUs < 0) {
                        // seek 落到檔案尾端之後，沒有資料可寫
                        muxer.release()
                        extractor.release()
                        throw Exception("Seek failed at segment $i")
                    }
                    val segmentDurationUs = (endMs - startMs) * 1000L
                    val actualEndUs = actualStartUs + segmentDurationUs - videoFrameDurationUs

                    android.util.Log.d("SplitDebug",
                        "段 $i：理論起點=${startMs}ms，實際起點=${actualStartUs / 1000.0}ms，" +
                        "實際終點=${actualEndUs / 1000.0}ms")

                    val buffer = java.nio.ByteBuffer.allocate(1024 * 1024)
                    val bufferInfo = MediaCodec.BufferInfo()

                    var writing = true
                    while (writing) {
                        val trackIndex = extractor.sampleTrackIndex
                        if (trackIndex < 0) { writing = false; continue }

                        val muxerTrack = trackIndexMap[trackIndex]
                        if (muxerTrack == null) { extractor.advance(); continue }

                        val sampleTimeUs = extractor.sampleTime
                        if (sampleTimeUs >= actualEndUs) { writing = false; continue }

                        bufferInfo.offset = 0
                        bufferInfo.size = extractor.readSampleData(buffer, 0)
                        if (bufferInfo.size < 0) { writing = false; continue }

                        bufferInfo.presentationTimeUs = sampleTimeUs - actualStartUs                        
                        bufferInfo.flags = extractor.sampleFlags

                        muxer.writeSampleData(muxerTrack, buffer, bufferInfo)
                        extractor.advance()
                    }

                    muxer.stop()
                    muxer.release()
                    extractor.release()

                    // 驗證產出檔案的實際時長
                    val verifier = MediaMetadataRetriever()
                    verifier.setDataSource(outputFile.absolutePath)
                    val outputDurationMs = verifier.extractMetadata(
                        MediaMetadataRetriever.METADATA_KEY_DURATION
                    )?.toLong() ?: -1L
                    verifier.release()
                    android.util.Log.d("SplitDebug",
                        "段 $i 產出時長=${outputDurationMs}ms（設定=${endMs - startMs}ms）")

                    val segmentInfo = Arguments.createMap()
                    segmentInfo.putString("fileName", fileName)
                    segmentInfo.putString("path", outputFile.absolutePath)
                    segmentInfo.putDouble("duration", (endMs - startMs) / 1000.0)
                    segmentInfo.putInt("index", i + 1)
                    results.pushMap(segmentInfo)

                    val progressParams = Arguments.createMap()
                    progressParams.putInt("current", i + 1)
                    progressParams.putInt("total", segmentCount)
                    progressParams.putDouble("progress", (i + 1).toDouble() / segmentCount)
                    reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("VideoSplitProgress", progressParams)
                }

                fd.close()
                promise.resolve(results)
            } catch (e: Exception) {
                promise.reject("SPLIT_ERROR", e.message)
            }
        }.start()
    }
}