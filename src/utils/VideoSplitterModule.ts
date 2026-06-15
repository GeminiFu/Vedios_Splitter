import {NativeModules, NativeEventEmitter} from 'react-native';

const {VideoSplitterModule} = NativeModules;
export const videoSplitterEmitter = new NativeEventEmitter(VideoSplitterModule);

export const getVideoDuration = (uri: string): Promise<number> => {
  return VideoSplitterModule.getVideoDuration(uri);
};

export const splitVideo = (
  uri: string,
  segmentDuration: number,
  outputDir: string,
  prefix: string,
): Promise<{fileName: string; path: string; duration: number; index: number}[]> => {
  return VideoSplitterModule.splitVideo(uri, segmentDuration, outputDir, prefix);
};