import {NativeModules} from 'react-native';

export const shareVideos = (paths: string[]): Promise<boolean> => {
  console.log('ShareModule direct access:', NativeModules.ShareModule);
  console.log('VideoSplitterModule direct access:', NativeModules.VideoSplitterModule);
  return NativeModules.VideoShareModule.shareVideos(paths);
};