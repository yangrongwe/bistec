<template>
	<view v-if="hasPermission">
		<view v-show="isOk" class="container">
			<image class="all-back" :src="back" mode=""></image>
			<bluetooth-content :launch="modalStatus" :isOk="isOk"></bluetooth-content>
			<view-tabbar :current="current" @changeToSport="changeToSport"></view-tabbar>
		</view>
	</view>
	<view v-else
		style="text-align: center;display: flex;justify-content: center;background-color: white;height: 100vh;">
		<view style="width: 80%;margin-top: 500rpx;">
			<view v-if="loading">
				<view><text>{{authErr?"权限验证失败，请联系客服":"正在验证是否授权，请稍等..."}}</text></view>
			</view>
			<view v-else>
				<view><text>当前用户未授权，请绑定授权码</text></view>
				<view style="margin-top: 24rpx;"> <uni-easyinput type="textarea" v-model="authCode" /></view>
				<view style="margin-top: 24rpx;"><button type="primary" plain="true" @tap="bindAuthCode">请求授权
					</button></view>
			</view>

		</view>

	</view>

</template>

<script>
	import Tabbar from '@/components/tabbar/Tabbar.vue';
	import BluetoothContent from "@/components/bluetoothContent/BluetoothContent.vue";

	export default {
		data() {
			return {
				hasPermission: false,
				loading: true,
				authErr: false,
				openId: "",
				authCode: "",
			}
		},
		computed: {
			isOk() {
				return this.$store.state.isOk
			},
			current() {
				console.log(this.$store.state.settingStatus.toString())
				return this.$store.state.settingStatus.toString();
			},
			back() {
				switch (this.$store.state.settingStatus) {
					case 0:
						return "http://bistec.cn/photo/pics/smallApp/backImage/sportBack.png";
					case 1:
						return "http://bistec.cn/photo/pics/smallApp/backImage/comfortBack.png";
					case 2:
						return "http://bistec.cn/photo/pics/smallApp/backImage/autoBack.png";
					case 3:
						return "http://bistec.cn/photo/pics/smallApp/backImage/settingBack.png";
					default:
						return ""
				}
			},
			modalStatus() {
				return this.$store.state.modalStatus;
			}
		},
		components: {
			'view-tabbar': Tabbar,
			'bluetooth-content': BluetoothContent
		},
		onLoad() {
			// 页面加载时验证权限
			this.checkPermission();
		},
		methods: {
			// 分享给好友
			onShareAppMessage() {
				return {
					title: 'ADC电控主动减震',
					path: '/pages/index/index',
					imageUrl: ''
				};
			},

			// 分享到朋友圈
			onShareTimeline() {
				return {
					title: '电控主动减震',
					path: '/pages/index/index',
					imageUrl: ''
				};
			},

			// 判断用户是否授权
			async checkPermission() {
				try {
					let that = this;
					uni.login({
						success: function(res) {
							if (res.code) {
								// 获取到code，可将其发送给后端
								let code = res.code;
								//  将code发送到后端换取OpenID,后端验证openId是否已经认证过了
								uni.request({
									url: 'https://www.bistec.cn/api/judge_auth',
									method: 'POST',
									data: {
										wx_code: code,
										app_id: 'wxb90a7178ae2b176e'
									},
									success: (res) => {
										if (res.data.code === 0) {
											// 已授权
											console.log("res.data", res.data)
											if (res.data.data.info) {
												that.hasPermission = true
											} else {
												// 未授权
												that.hasPermission = false
											}
											that.openId = res.data.data.openid
											that.loading = false;
										} else {
											// 报错
											console.log("res", res)
										}
									},
									fail: (err) => {
										that.authErr = true
									}
								});
							} else {
								console.log('获取登录凭证失败：' + res.errMsg);
							}
						}
					});
				} catch (error) {
					console.error('权限验证失败', error);
					uni.showToast({
						title: '权限验证失败',
						icon: 'none'
					});
				} finally {
					// this.loading = false;
				}
			},

			// 授权
			bindAuthCode() {
				let that = this;
				console.log("that.openId", that.openId)
				uni.request({
					url: 'https://www.bistec.cn/api/submit_auth',
					method: 'POST',
					data: {
						app_id: 'wxb90a7178ae2b176e',
						openid: that.openId,
						auth_code: that.authCode
					},
					success: (res) => {
						// 授权成功
						if (res.data.code === 0) {
							that.hasPermission = true
						} else {
							that.authErr = true
							uni.showToast({
								title: '授权码不存在',
								icon: 'none'
							});
						}

						that.loading = false;
					},
					fail: (err) => {
						that.authErr = true
					}
				});
			}
		}
	}
</script>

<style lang="less" scoped>
	.container {
		box-sizing: border-box;
		width: 100%;
		height: 100vh;
		font-size: 14px;
		line-height: 24px;
		background: #020314;

		.all-back {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100vh;
			z-index: 0;
		}
	}
</style>