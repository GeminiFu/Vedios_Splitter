export default {
  // 通用
  common: {
    confirm: '確認',
    cancel: '取消',
    error: '錯誤',
  },
  // 主畫面
  home: {
    title: '影片分割',
    selectVideo: '選擇影片',
    selected: '已選擇',
    duration: '時長',
    seconds: '秒',
    segmentDuration: '分割時長',
    segmentCount: '共會分割成',
    segmentUnit: '個片段',
    lastSegment: '⚠️ 最後一段時長',
    startSplit: '開始分割',
    splitting: '處理中',
    videoTooLong: '影片過長',
    videoTooLongMsg: '請選擇 10 分鐘以內的影片',
    videoError: '無法讀取影片',
    videoErrorMsg: '請選擇其他影片',
    splitFailed: '分割失敗',
    splitInfo: '分割資訊',
    next: '下一步',
  },
  // 影片預覽畫面
  preview: {
  title: '影片預覽',
  startSplit: '開始分割',
  reset: '重置',
  undo: '復原',
  deletePoint: '刪除',
  },
  // 結果畫面
  result: {
    title: '分割結果',
    completed: '處理完成，共',
    segments: '個片段',
    fileDuration: '時長',
    saveToGallery: '儲存到相簿',
    saving: '儲存中',
    saved: '✓ 已儲存到相簿',
    saveSuccess: '儲存成功',
    saveSuccessMsg: '已將 {{count}} 個片段儲存到相簿',
    saveFailed: '儲存失敗',
  },
  // 進度條
  progress: {
    processing: '處理中',
    segment: '個片段',
  },
};