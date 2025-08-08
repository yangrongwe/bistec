<script>
	export default {
		onLaunch: function() {
			uni.hideTabBar({
				animation: false
			});
			
			this.$store.commit("changeOk");
			
			// 检查更新
			    // #ifdef MP-WEIXIN
			       const updateManager = uni.getUpdateManager();
			   
			       updateManager.onCheckForUpdate(function (res) {
			           // 当有新版本时提示
			           if (res.hasUpdate) {
			               updateManager.onUpdateReady(function () {
			                   uni.showModal({
			                       title: '更新提示',
			                       content: '新版本已经准备好，是否重启应用？',
			                       success: function (res) {
			                           if (res.confirm) {
			                               // 新版本下载完成，应用更新
			                               updateManager.applyUpdate();
			                           }
			                       }
			                   });
			               });
			   
			               updateManager.onUpdateFailed(function () {
			                   // 新版本下载失败时提示
			                   uni.showModal({
			                       title: '已经有新版本了',
			                       content: '新版本已经上线，请您删除当前小程序，重新搜索打开',
			                   });
			               });
			           }
			       });
			       // #endif
			console.log('App Launch')
		},
		onShow: function() {
			uni.setKeepScreenOn({
				keepScreenOn: true
			});
			
			this.$store.commit("changeOk");
			
			this.$store.commit("changeShowTrue");
			console.log('App Show',	this.$store.state.isShow)
		},
		onHide: function() {
			if(uni.getStorageSync('deviceId')){
				uni.closeBLEConnection({
					deviceId: uni.getStorageSync('deviceId'),
					success: res => {
						console.log('蓝牙连接已断开', res);
					},
					fail: err => {
						console.error('断开蓝牙连接失败', err);
					}
				});
			}
			this.$store.commit("changeFailed");
				console.log('App onHide',	this.$store.state.isShow)
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';
	// 设置整个项目的背景色
	*{
		box-sizing: border-box!important;
		padding:0;
		margin:0;
	}
	page {
		background-color: #212121;
	}

	/* #endif */
</style>
