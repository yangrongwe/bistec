<template>
	<view class="bluetooth-content-box">
		<image v-for="(item, index) in urls" :key="index" :src="item" mode="" style="width: 0px;height: 0px;opacity: 0;"></image>
		<view class="header bis-flex" :style="{ height: totalHeight + 'px' }">
			<view>ADC电控主动减振</view>
			<uni-icons type="scan" size="20" color="white" style="margin-top: 8rpx;margin-left: 10rpx;" @click="resetScan"></uni-icons>
		</view>
		<view class="main">
			<blueModal :show="blueModalShow" :blueList="blueList" @unConnect="unConnect" @connect="blueConnect"></blueModal>
			<modal :show="modalShow" @showChange="showChange" @modalScan="modalScan"></modal>
			<img class="car-icon-img" :src="'http://bistec.cn/photo/pics/smallApp/iconImage/' + workCondition + '.png'" alt="" />
			<img class="bluetooth-signal-img" :src="bluetoothSignal" alt="" srcset="" @click="initBlueModal" />
			<view class="car-box">
				<!-- <img class="car-img" src="http://bistec.cn/photo/pics/smallApp/car.png" alt=""> -->
				<img class="disable-img" src="../../static/backImage/zuni_disable.png" alt="" />
				<view :style="{ left: 366 + G.GX + 'rpx', top: 290 + G.GY + 'rpx' }" class="center-point"></view>
			</view>
			<!-- <uni-icons class="phone-icon" type="phone" color="#0c66eb" size="30" @click="showChange(true)"></uni-icons> -->
			<bluetooth-signal class="signal-top left" :first="DC.FLCompress" :second="DC.FLDraw"></bluetooth-signal>
			<bluetooth-signal class="signal-top right" :right="true" :first="DC.FRDraw" :second="DC.FRCompress"></bluetooth-signal>
			<bluetooth-signal class="signal-bottom left" :first="DC.RLCompress" :second="DC.RLDraw"></bluetooth-signal>
			<bluetooth-signal class="signal-bottom right" :right="true" :first="DC.RRDraw" :second="DC.RRCompress"></bluetooth-signal>
		</view>
	</view>
</template>

<script>
import BluetoothSignal from '../bluetoothSignal/BluetoothSignal.vue';
import Modal from '@/components/modal/Modal.vue';
import BlueModal from '@/components/modal/BlueModal.vue';
import store from '../../store';
export default {
	name: 'BluetoothContent',
	data() {
		return {
			blueModalShow: false,
			blueList: [],
			blueListFlag: false,

			scanFlag: false,

			isShow: this.$store.state.isShow,
			connectedStatus: false,
			scanName: uni.getStorageSync('scanName') || '',
			currentMode: uni.getStorageSync('currentMode') ? parseInt(uni.getStorageSync('currentMode')) : 0,
			bluetoothSignal: 'http://bistec.cn/photo/pics/smallApp/iconImage/bluetooth_1.png',
			modalShow: false,
			system: [],
			menu: [],
			statusBarHeight: 0, //状态栏的高度
			navigatorHeight: 0, //导航栏高度
			menuHeight: 0, //胶囊高度
			menuTop: 0, //胶囊与顶部的距离
			totalHeight: 0, //总高度
			blueDeviceList: [],
			deviceId: uni.getStorageSync('deviceId') || '',
			uuidServices: '',
			characteristicId: '',
			G: {
				GX: 0,
				GY: 0
			},
			DC: {
				FLCompress: 0,
				FLDraw: 0,
				FRCompress: 0,
				FRDraw: 0,
				RLCompress: 0,
				RLDraw: 0,
				RRCompress: 0,
				RRDraw: 0
			},
			workCondition: 'cardrive',
			workConditionCode: 0,
			bluetoothCount: 0,
			urls: [
				//预加载图片地址
				'http://bistec.cn/photo/pics/smallApp/backImage/comfortBack.png',
				'http://bistec.cn/photo/pics/smallApp/backImage/autoBack.png'
			],
			timer: null,
			GTime: 0,
			fakeGArr: [
				[-15, -15],
				[-30, -30],
				[-45, -45],
				[-60, -60],
				[-75, -75],
				[-90, -90],
				[-100, -100],
				[-80, -105],
				[-60, -110],
				[-40, -115],
				[-20, -120],
				[0, -125],
				[10, -130],
				[20, -135],
				[30, -140],
				[20, -128],
				[30, -111],
				[40, -94],
				[50, -77],
				[60, -60],
				[70, -43],
				[80, -26],
				[90, -9],
				[100, 8],
				[110, 25],
				[120, 42],
				[130, 59],
				[110, 76],
				[93, 97],
				[76, 107],
				[59, 117],
				[42, 122],
				[25, 127],
				[8, 132],
				[-9, 137],
				[-26, 142],
				[-42, 147],
				[-30, 120],
				[-20, 100],
				[-10, 80],
				[0, 60],
				[0, 30],
				[0, 0]
			]
		};
	},
	props: ['launch', 'isOk'],
	watch: {
		isOk(val) {
			if (val && !this.scanFlag) {
				if (uni.getStorageSync('deviceId')) {
					this.scan();
				} else {
					this.modalShow = true;
				}
			} else {
				if (val) {
					this.scanFlag = false;
				}
			}
		}
	},
	components: {
		'bluetooth-signal': BluetoothSignal,
		modal: Modal,
		blueModal: BlueModal
	},
	methods: {
		unConnect() {
			this.blueModalShow = false;
		},
		blueConnect(data) {
			this.connect(data);
		},
		initBlueModal() {
			this.$set(this, 'blueList', []);
			// 设置标志为阻止扫描
			this.blueListFlag = true;
			let _ = this;
			uni.getConnectedBluetoothDevices({
				success: function(res) {
					console.log("存在蓝牙设备集合 res.devices",res.devices);
					if (res.devices.length > 0) {
						res.devices.forEach(device => {
							console.log('设备ID:', device.deviceId);
							console.log('设备名称:', device.name);
							uni.closeBLEConnection({
								deviceId: device.deviceId,
								success: res => {
									console.log('蓝牙连接已断开1', res);
									_.connectedStatus = false;
									_.initBlue();
								},
								fail: err => {
									console.error('断开蓝牙连接失败', err);
									// this.initBlue();
								}
							});
						});
					} else {
						uni.closeBLEConnection({
							deviceId: uni.getStorageSync('deviceId'),
							success: res => {
								console.log('蓝牙连接已断开1---', res);
								_.connectedStatus = false;
								_.initBlue();
							},
							fail: err => {
								console.error('断开蓝牙连接失败-----', err);
								// this.initBlue();
							}
						});

						// if (uni.getStorageSync('deviceId')) {
						// 	uni.removeStorageSync('deviceId');
						// 	uni.removeStorageSync('scanName');
						// 	_.deviceId = '';
						// 	_.scanName = '';
						// }
						_.initBlue();
						console.log('当前没有连接的蓝牙设备');
					}
				},
				fail: function(err) {
					console.error('获取连接设备失败：', err);
					_.initBlue();
				}
			});
			// if (uni.getStorageSync('deviceId')) {

			// }
			// this.initBlue();
			// 打开弹出框
			this.blueModalShow = true;
		},
		scan() {
			// 如果已经连接过蓝牙，断开蓝牙连接
			// if (this.connectedStatus &&uni.getStorageSync('deviceId') ) {
			// 	//
			// } else {
			this.blueListFlag = false;
			this.initBlue();
			// }
		},
		resetScan() {
			this.blueListFlag = false;
			if (uni.getStorageSync('deviceId')) {
				uni.closeBLEConnection({
					deviceId: uni.getStorageSync('deviceId'),
					success: res => {
						console.log('蓝牙连接已断开1', res);
						if (uni.getStorageSync('deviceId')) {
							uni.removeStorageSync('deviceId');
							uni.removeStorageSync('scanName');
							this.deviceId = '';
							this.scanName = '';
						}
						this.connectedStatus = false;
						this.initBlue();
					},
					fail: err => {
						console.error('断开蓝牙连接失败', err);
						this.initBlue();
					}
				});
			} else {
				this.initBlue();
			}

			// this.scan();
		},
		modalScan(bool) {
			this.modalShow = bool;
			this.scan();
		},
		showChange(bool) {
			this.modalShow = bool;
		},
		// 【1】初始化蓝牙
		initBlue() {
			this.bluetoothSignal = 'http://bistec.cn/photo/pics/smallApp/iconImage/bluetooth_1.png';
			const that = this;
			//蓝牙初始化
			uni.openBluetoothAdapter({
				success(res) {
					console.log('初始化蓝牙成功');
					// that.discovery();
					// 初次加载或者点击蓝牙图标
					console.log('”this.blueListFlag', that.blueListFlag);
					if (!that.blueListFlag) {
						if (!uni.getStorageSync('deviceId')) {
							that.scanFlag = true;
							uni.scanCode({
								success: function(res) {
									that.scanName = res.result;
									// 寻找对应名字的蓝牙设备
									that.discovery();
								}
							});
						} else {
							console.log('uni.getStorageSync scanName', uni.getStorageSync('scanName'));
							that.scanName = uni.getStorageSync('scanName');
							that.discovery();
						}
					} else {
						// 不指定名字
						that.discovery();
					}
				},
				fail(err) {
					console.log('初始化蓝牙失败', err);
					if (err.errCode == 10001) {
						uni.showToast({
							icon: 'error',
							title: '请打开蓝牙',
							duration: 2000
						});
					}
					setTimeout(() => {
						that.initBlue();
					}, 1000);
				}
			});
		},
		// 【2】开始搜寻附近设备
		discovery() {
			const that = this;
			uni.startBluetoothDevicesDiscovery({
				allowDuplicatesKey: true, 
				success(res) {
					console.log('开始搜索');
					// 开启监听回调
					uni.onBluetoothDeviceFound(that.found);
				},
				fail(err) {
					console.log('搜索失败');
					console.error(err);
				}
			});
		},
		// 【3】找到新设备就触发该方法
		found(res) {
			// if (res.devices[0].name == 'BIS') {
			// 	this.blueDeviceList.push(res.devices[0]);
			// 	this.connect(res.devices[0]);
			// }
			// console.log('res.devices[0]', res.devices);
			// 找到扫描二维码对应的蓝牙
			console.log('搜索后追加链接');
			if (!this.blueListFlag) {
				if (res.devices[0].name == this.scanName) {
					this.blueDeviceList.push(res.devices[0]);
					this.connect(res.devices[0]);
				}
			} else {
				// 把蓝牙填到list中
				let flag = true;
				this.blueList.map(item => {
					if (item.name == res.devices[0].name) {
						flag = false;
					}
				});
				if (flag) {
					this.blueList.push(res.devices[0]);
				}
				console.log('搜索后追加链接，this.blueList',this.blueList);
			}
		},
		// 【4】连接设备
		connect(data) {
			const that = this;
			this.blueModalShow = false;
			console.log(data);
			this.deviceId = data.deviceId;

			uni.createBLEConnection({
				deviceId: this.deviceId,
				success(res) {
					console.log('连接成功');
					uni.setStorageSync('deviceId', data.deviceId);
					if (that.blueListFlag) {
						uni.setStorageSync('scanName', data.name);
					} else {
						uni.setStorageSync('scanName', that.scanName);
					}
					that.blueListFlag = false;

					that.connectedStatus = true;
					// 停止搜索
					that.stopDiscovery();
					that.getServices();

					uni.onBLEConnectionStateChange(function(res) {
						if (!res.connected) {
							// 蓝牙断开连接，通知用户
							that.DC = {
								FLCompress: 0,
								FLDraw: 0,
								FRCompress: 0,
								FRDraw: 0,
								RLCompress: 0,
								RLDraw: 0,
								RRCompress: 0,
								RRDraw: 0
							};
							that.bluetoothSignal = 'http://bistec.cn/photo/pics/smallApp/iconImage/bluetooth_1.png';
							uni.showToast({
					 		title: '蓝牙已断开',
								icon: 'none',
					 		duration: 2000
							});
						}
					});
				},
				fail(err) {
					console.log('连接失败');
					console.error(err);
				}
			});
		},
		// 【4.1】重连设备
		reconnect() {
			const that = this;
			uni.createBLEConnection({
				deviceId: uni.getStorageSync('deviceId'),
				success(res) {
					console.log('连接成功');
					console.log(res);
					// 停止搜索
					// that.stopDiscovery();
					that.getServices();
					// getServices();
					// getCharacteristics()
				},
				fail(err) {
					console.log('重新连接失败');
					console.error(err);
				}
			});
		},
		// 【5】停止搜索
		stopDiscovery() {
			uni.stopBluetoothDevicesDiscovery({
				success(res) {
					console.log('停止成功');
					console.log(res);
				},
				fail(err) {
					console.log('停止失败');
					console.error(err);
				}
			});
		},
		// 【6】获取服务
		getServices() {
			const that = this;
			uni.getBLEDeviceServices({
				deviceId: uni.getStorageSync('deviceId'), // 设备ID，在上一步【4】里获取
				success(res) {
					console.error('获取服务成功', res.services);
					that.uuidServices = res.services[0].uuid;
					uni.setStorageSync('uuidServices', res.services[0].uuid);
					that.getCharacteristics();
				},
				fail(err) {
					console.error('获取服务失败');
				}
			});
		},
		// 【7】获取特征值
		getCharacteristics() {
			const that = this;
			uni.getBLEDeviceCharacteristics({
				deviceId: uni.getStorageSync('deviceId'), // 设备ID，在【4】里获取到
				serviceId: uni.getStorageSync('uuidServices'), // 服务UUID，在【6】里能获取到
				success(res) {
					console.log('获取特征值成功', res);
					console.log('characteristics.notify', res.characteristics[1].properties.notify);
					that.characteristicId = res.characteristics[1].uuid;
					uni.setStorageSync('writeCharacteristicId', res.characteristics[0].uuid);
					uni.setStorageSync('characteristicId', res.characteristics[1].uuid);
					setTimeout(() => {
						that.notify();
					}, 3000);
				},
				fail(err) {
					console.log('获取特征值失败', err.errMsg);
				}
			});
		},
		// 【8】开启消息监听
		notify() {
			const that = this;
			console.log(' this.uuidServices', this.uuidServices);
			console.log(' this.characteristicId', this.characteristicId);
			uni.notifyBLECharacteristicValueChange({
				state: true,
				deviceId: this.deviceId, // 设备ID，在【4】里获取到
				serviceId: this.uuidServices, // 服务UUID，在【6】里能获取到
				characteristicId: this.characteristicId, // 特征值，在【7】里能获取到

				success(res) {
					console.log('开启消息监听成功', res); // 接受消息的方法
					that.listenValueChange();
				},
				fail(err) {
					console.error('开启消息失败', err.errMsg);
					uni.closeBLEConnection({
						deviceId: device.deviceId,
						success: res => {
							console.log('蓝牙连接已断开1', res);
							_.connectedStatus = false;
							_.initBlue();
						},
						fail: err => {
							console.error('断开蓝牙连接失败', err);
							// this.initBlue();
						}
					});
				}
			});
		},

		// 将16进制的内容转成我们看得懂的字符串内容
		hexCharCodeToStr(hexCharCodeStr) {
			var trimedStr = hexCharCodeStr.trim();
			var rawStr = trimedStr.substr(0, 2).toLowerCase() === '0x' ? trimedStr.substr(2) : trimedStr;
			var len = rawStr.length;
			if (len % 2 !== 0) {
				alert('存在非法字符!');
				return '';
			}
			var curCharCode;
			var resultStr = [];
			for (var i = 0; i < len; i = i + 2) {
				curCharCode = parseInt(rawStr.substr(i, 2), 16);
				resultStr.push(String.fromCharCode(curCharCode));
			}
			return resultStr.join('');
		},
		// 【9】监听消息变化
		listenValueChange() {
			const that = this;
			console.log('onBLECharacteristicValueChange已经开启监听');
			uni.onBLECharacteristicValueChange(res => {
				console.log('监听的值', res.value);

				var data = new Uint8Array(res.value);
				var dataView = new DataView(data.buffer);

				// 数据帧头帧尾校验

				const begin = dataView.getUint32(0, true);
				const end = dataView.getUint32(16, true);
				let regStatus = false;

				if (begin == 4278124543 && end == 4294967038) {
					regStatus = true;
				}

				if (dataView && regStatus) {
					const firstCode = dataView.getUint32(4, true);
					const secondCode = dataView.getUint32(8, true);
					const thirdCode = dataView.getUint32(12, true);
					// console.log("firstCode",firstCode);
					// console.log(secondCode);
					// 输出3设定
					// 阻尼设定
					that.DC = {
						FLCompress: (thirdCode >> 28) & 0x0f,
						FLDraw: (thirdCode >> 24) & 0x0f,
						FRCompress: (thirdCode >> 20) & 0x0f,
						FRDraw: (thirdCode >> 16) & 0x0f,
						RLCompress: (thirdCode >> 12) & 0x0f,
						RLDraw: (thirdCode >> 8) & 0x0f,
						RRCompress: (thirdCode >> 4) & 0x0f,
						RRDraw: (thirdCode >> 0) & 0x0f
					};

					// console.log('that.DC', that.DC);

					// 输出1设定
					//工况，当前版本不需要
					let workConditionInt = (firstCode >> 2) & 0x07;
					// 判断工况是否改变
					// console.log('that.workConditionCode', that.workConditionCode);
					// console.log('that.workConditionInt', workConditionInt);
					if (that.workConditionCode != workConditionInt) {
						that.workConditionCode = workConditionInt;
						that.workCondition = '';
						switch (workConditionInt) {
							case 0:
								that.workCondition = 'carbrake';
								break;
							case 1:
								that.workCondition = 'turnleft';
								break;
							case 2:
								that.workCondition = 'carstop';
								break;
							case 3:
								that.workCondition = 'turnright';
								break;
							case 4:
								that.workCondition = 'cardrive';
						}
					}

					//模式反馈
					const mode = (firstCode >> 0) & 0x03;
					if (that.currentMode != mode) {
						store.commit('changeSettingStatus', mode);
						uni.setStorageSync('currentMode', that.currentMode);
					}

					that.currentMode = mode;

					//2576992456
					// 1001,1001,1001,1001,11001000,11001000
					// 输出2设定
					const GX = (secondCode >> 8) & 0xff;
					const GY = (secondCode >> 0) & 0xff;

					that.G = { GX: GX - 100, GY: GY - 100 };

					// 前悬架
					const frontSuspension = (secondCode >> 16) & 0x0f; //9
					// 侧倾
					const heel = (secondCode >> 20) & 0x0f; //9
					// 后悬架
					const behindSuspension = (secondCode >> 24) & 0x0f; //9
					// 拉压
					const DC = (secondCode >> 28) & 0x0f; //9

					// 		console.log("secondCode",secondCode)
					// console.log("前悬架",frontSuspension)
					// console.log("侧倾",heel)
					// console.log("后悬架",behindSuspension)
					// console.log("拉压",DC)

					uni.setStorageSync('setting', JSON.stringify({ GX, GY, frontSuspension, heel, behindSuspension, DC }));

					if (that.bluetoothCount % 5 == 0) {
						// that.workCondition = workCondition;
					}
					if (that.bluetoothCount % 100 == 0) {
						// 每隔1s监测蓝牙信号强度
						uni.getBLEDeviceRSSI({
							deviceId: that.deviceId,
							success(res) {
								if (res.RSSI < 0 && res.RSSI >= -50) {
									//信号最强情况处理
									that.bluetoothSignal = 'http://bistec.cn/photo/pics/smallApp/iconImage/bluetooth_5.png';
								} else if (res.RSSI < -50 && res.RSSI >= -70) {
									//信号次强处理
									that.bluetoothSignal = 'http://bistec.cn/photo/pics/smallApp/iconImage/bluetooth_4.png';
								} else if (res.RSSI < -70 && res.RSSI >= -80) {
									//信号中等强度处理
									that.bluetoothSignal = 'http://bistec.cn/photo/pics/smallApp/iconImage/bluetooth_3.png';
								} else if (res.RSSI < -80 && res.RSSI >= -90) {
									//信号次弱强度处理
									that.bluetoothSignal = 'http://bistec.cn/photo/pics/smallApp/iconImage/bluetooth_2.png';
								} else if (res.RSSI < -90) {
									//信号最弱强度处理
									uni.showToast({
										title: '蓝牙信号弱',
										duration: 1000
									});
									that.bluetoothSignal = 'http://bistec.cn/photo/pics/smallApp/iconImage/bluetooth_1.png';
								}
							},
							fail: function(err) {
								that.bluetoothSignal = 'http://bistec.cn/photo/pics/smallApp/iconImage/bluetooth_1.png';
								console.error('获取设备 RSSI 失败:', err);
							}
						});
					}
					that.bluetoothCount++;
				} else {
					console.info('数据格式异常');
				}
			});
		},
		//2进制字符串补充至32位
		addToInt32(str) {
			for (let i = str.length; i < 32; i++) {
				str = '0' + str;
			}
			return str;
		},
		//值变化限制
		changeLimit(newval, old, maxlimit, max, minLimit = 0) {
			//新值大于旧值时
			if (newval > old) {
				//若新值大于旧制加最大限制变化
				if (newval > old + maxlimit) {
					//若旧值大于最大值
					if (old + maxlimit >= max) {
						newval = max;
					} else {
						newval = old + maxlimit;
					}
					//若新值小于旧值减最小限制变化
				} else if (newval - old < minLimit) {
					newval = newval + minLimit;
				}
			} else if (newval < old) {
				if (newval < old - maxlimit) {
					newval = old - maxlimit;
				} else if (old - newval < minLimit) {
					newval = newval - minLimit;
				}
			} else {
				if (old + maxlimit >= max) {
					newval = max;
				} else {
					newval = old + maxlimit;
				}
			}
			return newval;
		},
		//假数据
		fakeData() {
			const randomList = [];
			for (let i = 0; i < 8; i++) {
				randomList.push(Math.ceil(Math.random() * 8));
			}
			let FLcom = randomList[0];
			this.DC.FLCompress = this.changeLimit(FLcom, this.DC.FLCompress, 2, 8);
			let FLdra = randomList[1];
			this.DC.FLDraw = this.changeLimit(FLdra, this.DC.FLDraw, 2, 8);
			let FRcom = randomList[2];
			this.DC.FRCompress = this.changeLimit(FRcom, this.DC.FRCompress, 2, 8);
			let FRdra = randomList[3];
			this.DC.FRDraw = this.changeLimit(FRdra, this.DC.FRDraw, 2, 8);
			let RLcom = randomList[4];
			this.DC.RLCompress = this.changeLimit(RLcom, this.DC.RLCompress, 2, 8);
			let RLdra = randomList[5];
			this.DC.RLDraw = this.changeLimit(RLdra, this.DC.RLDraw, 2, 8);
			let RRcom = randomList[6];
			this.DC.RRCompress = this.changeLimit(RRcom, this.DC.RRCompress, 2, 8);
			let RRdra = randomList[7];
			this.DC.RRDraw = this.changeLimit(RRdra, this.DC.RRDraw, 2, 8);

			if (this.GTime == this.fakeGArr.length) {
				this.GTime = 0;
			}
			this.G.GX = this.fakeGArr[this.GTime][0];
			this.G.GY = this.fakeGArr[this.GTime][1];
			this.GTime++;
		},
		changeFakeData() {
			const that = this;
			if (this.timer) {
				clearInterval(this.timer);
				this.timer = null;
			}
			this.timer = setInterval(() => {
				that.fakeData();
			}, 150);
		}
	},

	created() {
		// if (this.launch) {
		// 	this.modalShow = true;
		// }

		//获取系统信息
		uni.getSystemInfo({
			success: res => {
				this.system = res;
			}
		});

		//获取胶囊信息
		this.menu = uni.getMenuButtonBoundingClientRect();

		//计算组件高度
		this.statusBarHeight = this.system.statusBarHeight; //状态栏高度
		this.menuHeight = this.menu.height; //胶囊高度
		this.menuTop = this.menu.top; //胶囊与顶部的距离
		//导航栏高度= （胶囊顶部距离-状态栏高度） x 2 + 胶囊的高度
		this.navigatorHeight = (this.menu.top - this.system.statusBarHeight) * 2 + this.menu.height;
		//总高度 = 状态栏的高度 + 导航栏高度
		this.totalHeight = this.statusBarHeight + this.navigatorHeight;

		// if (this.isOk ) {
		// 	console.log("this.$store.state.blueStatus**************"+this.$store.state.blueStatus)
		// if(!this.$store.state.blueStatus){
		// 触发蓝牙扫描
		// this.initBlue();
		// this.changeFakeData();
		// }else{
		// 	this.reconnect();
		// 判断蓝牙是否连接过，如果连接过就直接访问
		// 如果未连接弹出模态框

		// }
		if (this.isOk) {
			console.log('==========================created================', this.isOk);
			if (uni.getStorageSync('deviceId')) {
				this.scan();
			} else {
				this.modalShow = true;
			}
		}
	}
};
</script>

<style lang="less" scoped>
.bis-flex {
	display: flex;
	align-items: center;
	justify-content: center;

	margin-top: 20rpx;
}
.bluetooth-content-box {
	box-sizing: border-box;
	position: relative;
	padding-bottom: 220rpx;
	width: 100%;
	height: 100%;
	.header {
		width: 100%;
		color: white;
		text-align: center;
		font-size: 32rpx;
	}
	.main {
		box-sizing: border-box;
		position: relative;
		width: 100%;
		height: 100%;
		.car-icon-img {
			box-sizing: border-box;
			display: block;
			margin-top: 10rpx;
			margin: 0 auto;
			width: 140rpx;
			height: 140rpx;
		}
		.bluetooth-signal-img {
			display: block;
			position: absolute;
			right: 40rpx;
			top: 50rpx;
			width: 60rpx;
			height: 38rpx;
		}
		.car-box {
			position: relative;
			top: 50%;
			transform: translateY(-70%);
			width: 100%;
			height: 774rpx;
			.car-img {
				margin: 0 auto;
				display: block;
				width: 342rpx;
				height: 100%;
			}
			.disable-img {
				display: block;
				position: absolute;
				top: 12%;
				left: 50%;
				transform: translateX(-50%);
				width: 412rpx;
				height: 412rpx;
			}
			.center-point {
				position: absolute;
				top: 290rpx;
				left: 366rpx;
				width: 0;
				height: 0;
				border: 10rpx solid red;
				border-radius: 10rpx;
				transition: all 0.3s;
			}
		}
		.signal-top {
			position: absolute;
			top: 140rpx;
			z-index: 1;
		}
		.signal-bottom {
			position: absolute;
			bottom: 200rpx;
			z-index: 1;
		}
		.left {
			left: 40rpx;
			z-index: 1;
		}
		.right {
			right: 40rpx;
			z-index: 1;
		}
		.phone-icon {
			position: absolute;
			top: 45%;
			right: 40rpx;
			z-index: 10;
		}
	}
}
</style>
