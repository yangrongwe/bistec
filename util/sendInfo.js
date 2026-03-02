export function sendData(modeIndex, that) {
	// 当前模式个性化
	var mode = modeIndex; //3
	// 拉呀/侧倾/前悬架/后悬架
	var la_ya = that.drawProgress; //2
	var hou_xuan_jia = that.gaugeList[2].progress; //2
	var ce_qing = that.gaugeList[1].progress; //2
	var qian_xuan_jia = that.gaugeList[0].progress; //2
	// 快速调节
	var kuai_su_tiao_jie = that.sceneListIndex; //1

	// 原始数据计算
	var data = mode +
		(la_ya << 2) +
		(hou_xuan_jia << 6) +
		(ce_qing << 10) +
		(qian_xuan_jia << 14) +
		(kuai_su_tiao_jie << 18);

	// ⚠激活标志位
	data |= (1 << 20) | (0 << 21) | (0 << 22);
	console.log("发送的数据***************", data);
	//  01 0110 0110 0110 0110 11
	var buff = new Uint8Array(12);
	buff[0] = 0xff;
	buff[1] = 0xff;
	buff[2] = 0xfe;
	buff[3] = 0xfe;
	buff[4] = data & 0xFF;
	buff[5] = (data >> 8) & 0xFF;
	buff[6] = (data >> 16) & 0xFF;
	buff[7] = (data >> 24) & 0xFF;
	buff[8] = 0xfe;
	buff[9] = 0xfe;
	buff[10] = 0xff;
	buff[11] = 0xff;
	console.log("发送的数据***********buff****", buff.buffer);
	uni.writeBLECharacteristicValue({
		deviceId: uni.getStorageSync("deviceId"), // 设备ID，在【4】里获取到
		serviceId: uni.getStorageSync("uuidServices"), // 服务UUID，在【6】里能获取到
		characteristicId: uni.getStorageSync("writeCharacteristicId"), // 特征值，在【7】里能获取到
		value: buff.buffer,
		success(res) {
			console.log('发送数据成功', res);
			uni.showToast({
				title: '已应用',
				duration: 2000
			});
			// setTimeout(()=>{
			// 	uni.navigateTo({
			// 		url:"/pages/index/index"
			// 	})
			// },2000)
		},
		fail(err) {
			console.error('发送数据失败', err);
			uni.showToast({
				title: '应用失败，请检查蓝牙连接状态',
				icon: 'none',
				duration: 2000
			});
		}
	});
}