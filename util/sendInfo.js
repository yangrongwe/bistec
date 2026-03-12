import bluetoothManager from './bluetoothManager.js';

export function sendData(modeIndex, that) {
	// 当前模式
	var mode = modeIndex; // 位2~1
	// 拉压/侧倾/前悬架/后悬架强度（1-9级）
	var la_ya = that.drawProgress || 1; // 拉压强度 位6~3
	var hou_xuan_jia = (that.gaugeList && that.gaugeList[2] && that.gaugeList[2].progress) || 1; // 后悬架强度 位10~7
	var ce_qing = (that.gaugeList && that.gaugeList[1] && that.gaugeList[1].progress) || 1; // 侧倾强度 位14~11
	var qian_xuan_jia = (that.gaugeList && that.gaugeList[0] && that.gaugeList[0].progress) || 1; // 前悬架强度 位18~15
	// 快速调节
	var kuai_su_tiao_jie = that.sceneListIndex || 0; // 位20~19
	// 激活标志位
	var activateFlag = that.activateFlag ?? 1; // 默认为1（激活）

	// 原始数据计算 - 使用正确的位偏移
	// 激活标志位(23-21): 2^20
	// 快速调节(20-19): 2^18
	// 前悬架强度(18-15): 2^14
	// 侧倾强度(14-11): 2^10
	// 后悬架强度(10-7): 2^6
	// 拉压强度(6-3): 2^2
	// 当前模式反馈(2-1): 2^0
	var data = mode +
		(la_ya << 2) +
		(hou_xuan_jia << 6) +
		(ce_qing << 10) +
		(qian_xuan_jia << 14) +
		(kuai_su_tiao_jie << 18);
	
	// 激活标志位设置
	if (activateFlag === 1) {
		data += (1 << 20); // 激活标志位设为1
	}
	console.log("各部分值: mode=", mode, "la_ya=", la_ya, "hou_xuan_jia=", hou_xuan_jia, "ce_qing=", ce_qing, "qian_xuan_jia=", qian_xuan_jia, "kuai_su_tiao_jie=", kuai_su_tiao_jie, "activateFlag=", activateFlag);
	console.log("发送的数据***************", data);
	// 确保二进制表示为32位
	const binaryString = data.toString(2).padStart(32, '0');
	console.log("二进制表示:", binaryString);
	console.log("分段表示: 激活标志位(23-21):", (data >> 21).toString(2).padStart(3, '0'), 
		"快速调节(20-19):", ((data >> 19) & 0x03).toString(2).padStart(2, '0'),
		"前悬架(18-15):", ((data >> 15) & 0x0f).toString(2).padStart(4, '0'),
		"侧倾(14-11):", ((data >> 11) & 0x0f).toString(2).padStart(4, '0'),
		"后悬架(10-7):", ((data >> 7) & 0x0f).toString(2).padStart(4, '0'),
		"拉压(6-3):", ((data >> 3) & 0x0f).toString(2).padStart(4, '0'),
		"模式(2-1):", (data & 0x03).toString(2).padStart(2, '0'));
	// 验证各参数的计算是否正确
	const baseData = mode + (la_ya << 2) + (hou_xuan_jia << 6) + (ce_qing << 10) + (qian_xuan_jia << 14) + (kuai_su_tiao_jie << 18);
	console.log("基础数据(不含激活标志位):", baseData);
	console.log("激活标志位值:", activateFlag === 1 ? (1 << 20) : 0);
	console.log("计算验证: baseData + activateFlagValue =", baseData + (activateFlag === 1 ? (1 << 20) : 0));

	// 构造数据帧：针头 + 数据 + 针尾
	var buff = new Uint8Array(12);
	// 针头：FF FF FE FE
	buff[0] = 0xFF;
	buff[1] = 0xFF;
	buff[2] = 0xFE;
	buff[3] = 0xFE;
	// 数据（小端序）
	buff[4] = data & 0xFF;
	buff[5] = (data >> 8) & 0xFF;
	buff[6] = (data >> 16) & 0xFF;
	buff[7] = (data >> 24) & 0xFF;
	// 针尾：FE FE FF FF
	buff[8] = 0xFE;
	buff[9] = 0xFE;
	buff[10] = 0xFF;
	buff[11] = 0xFF;
	console.log("发送的数据***********buff****", buff.buffer);

	// 发送命令前停止监听
	try {
		uni.offBLECharacteristicValueChange();
		console.log("已停止蓝牙监听");
	} catch (e) {
		console.error("停止监听失败", e);
	}

	// 使用bluetoothManager实例发送数据
	bluetoothManager.sendData(buff.buffer).then((res) => {
		console.log('发送数据成功', res);
		uni.showToast({
			title: '已应用',
			duration: 2000
		});
		
		// 发送命令后开启监听（除了去激活命令）
		if (activateFlag !== 0) {
			try {
				// 重新开启监听
				console.log("重新开启蓝牙监听");
				// 重新开启特征值变化监听
				bluetoothManager.notify().then(() => {
					console.log("特征值监听已开启");
					// 重新注册特征值变化回调
					if (bluetoothManager.listenCallback) {
						bluetoothManager.listenValueChange(bluetoothManager.listenCallback);
						console.log("特征值变化回调已重新注册");
					}
				}).catch((err) => {
					console.error("开启特征值监听失败", err);
				});
			} catch (e) {
				console.error("开启监听失败", e);
			}
		}
	}).catch((err) => {
		console.error('发送数据失败', err);
		uni.showToast({
			title: '应用失败，请检查蓝牙连接状态',
			icon: 'none',
			duration: 2000
		});
		
		// 发送失败也重新开启监听（除了去激活命令）
		if (activateFlag !== 0) {
			try {
				console.log("重新开启蓝牙监听");
				// 重新开启特征值变化监听
				bluetoothManager.notify().then(() => {
					console.log("特征值监听已开启");
					// 重新注册特征值变化回调
					if (bluetoothManager.listenCallback) {
						bluetoothManager.listenValueChange(bluetoothManager.listenCallback);
						console.log("特征值变化回调已重新注册");
					}
				}).catch((err) => {
					console.error("开启特征值监听失败", err);
				});
			} catch (e) {
				console.error("开启监听失败", e);
			}
		}
	});
}