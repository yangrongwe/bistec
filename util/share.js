export default {
  onLoad() {
    // 显示分享菜单
    uni.showShareMenu({
      withShareTicket: true, 
      menus: ['shareAppMessage', 'shareTimeline'] 
    });
  },
  onShareAppMessage() {
    return {
      title: '默认分享标题', 
      path: '/pages/index/index', 
      imageUrl: '' 
    };
  },
  onShareTimeline() {
    return {
      title: '默认分享到朋友圈标题', 
      path: '/pages/index/index', 
      imageUrl: '' 
    };
  }
};