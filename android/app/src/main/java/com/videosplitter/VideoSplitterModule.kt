package com.videosplitter

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

                    val buffer = java.nio.ByteBuffer.allocate(1024 * 1024)
                    val bufferInfo = MediaCodec.BufferInfo()

                    var writing = true
                    while (writing) {
                        val trackIndex = extractor.sampleTrackIndex
                        if (trackIndex < 0) { writing = false; continue }

                        val muxerTrack = trackIndexMap[trackIndex]
                        if (muxerTrack == null) { extractor.advance(); continue }

                        val sampleTimeUs = extractor.sampleTime
                        if (sampleTimeUs > endMs * 1000) { writing = false; continue }

                        bufferInfo.offset = 0
                        bufferInfo.size = extractor.readSampleData(buffer, 0)
                        if (bufferInfo.size < 0) { writing = false; continue }

                        bufferInfo.presentationTimeUs = sampleTimeUs - startMs * 1000
                        bufferInfo.flags = extractor.sampleFlags
                        muxer.writeSampleData(muxerTrack, buffer, bufferInfo)
                        extractor.advance()
                    }

                    muxer.stop()
                    muxer.release()
                    extractor.release()

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