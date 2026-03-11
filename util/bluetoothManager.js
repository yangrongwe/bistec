// 蓝牙管理工具类
class BluetoothManager {
  constructor() {
    this.deviceId = uni.getStorageSync("deviceId") || "";
    this.scanName = uni.getStorageSync("scanName") || "";
    this.uuidServices = "";
    this.characteristicId = "";
    this.writeCharacteristicId = "";
    this.connectedStatus = false;
    this.blueList = [];
    this.blueListFlag = false;
    this.scanFlag = false;
    this.listenCallback = null;
  }

  // 初始化蓝牙
  async initBlue() {
    return new Promise((resolve, reject) => {
      uni.openBluetoothAdapter({
        success: (res) => {
          console.log("初始化蓝牙成功");
          resolve(res);
        },
        fail: (err) => {
          console.log("初始化蓝牙失败", err);
          if (err.errCode == 10001) {
            uni.showToast({
              icon: "error",
              title: "请打开蓝牙",
              duration: 2000,
            });
          }
          reject(err);
        },
      });
    });
  }

  // 开始搜索蓝牙设备
  async startDiscovery() {
    return new Promise((resolve, reject) => {
      uni.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: true,
        success: (res) => {
          console.log("开始搜索蓝牙设备");
          resolve(res);
        },
        fail: (err) => {
          console.log("搜索蓝牙设备失败");
          console.error(err);
          reject(err);
        },
      });
    });
  }

  // 停止搜索蓝牙设备
  async stopDiscovery() {
    return new Promise((resolve, reject) => {
      uni.stopBluetoothDevicesDiscovery({
        success: (res) => {
          console.log("停止搜索蓝牙设备成功");
          resolve(res);
        },
        fail: (err) => {
          console.log("停止搜索蓝牙设备失败");
          console.error(err);
          reject(err);
        },
      });
    });
  }

  // 监听蓝牙设备发现
  onBluetoothDeviceFound(callback) {
    uni.onBluetoothDeviceFound(callback);
  }

  // 连接蓝牙设备
  async connect(device) {
    return new Promise((resolve, reject) => {
      this.deviceId = device.deviceId;

      uni.createBLEConnection({
        deviceId: this.deviceId,
        success: (res) => {
          console.log("连接蓝牙设备成功");
          uni.setStorageSync("deviceId", device.deviceId);
          if (this.blueListFlag) {
            uni.setStorageSync("scanName", device.name);
            this.scanName = device.name;
          }
          this.blueListFlag = false;
          this.connectedStatus = true;
          resolve(res);
        },
        fail: (err) => {
          console.log("连接蓝牙设备失败");
          console.error(err);
          reject(err);
        },
      });
    });
  }

  // 断开蓝牙连接
  async disconnect() {
    if (!this.deviceId) return;

    return new Promise((resolve, reject) => {
      uni.closeBLEConnection({
        deviceId: this.deviceId,
        success: (res) => {
          console.log("断开蓝牙连接成功");
          this.connectedStatus = false;
          resolve(res);
        },
        fail: (err) => {
          console.error("断开蓝牙连接失败", err);
          reject(err);
        },
      });
    });
  }

  // 获取蓝牙设备服务
  async getServices() {
    if (!this.deviceId) throw new Error("未连接蓝牙设备");

    const isHarmony = await this.isHarmonyOS();

    return new Promise((resolve, reject) => {
      uni.getBLEDeviceServices({
        deviceId: this.deviceId,
        success: (res) => {
          console.log("获取服务成功", res.services);

          if (isHarmony && res.services.length > 1) {
            // 鸿蒙：尝试找 FFB0 服务
            let targetService = null;
            for (let i = 0; i < res.services.length; i++) {
              if (res.services[i].uuid.includes("FFB0")) {
                targetService = res.services[i];
                break;
              }
            }
            this.uuidServices = targetService
              ? targetService.uuid
              : res.services[0].uuid;
          } else {
            // iOS/Android：直接用第一个
            this.uuidServices = res.services[0].uuid;
          }

          uni.setStorageSync("uuidServices", this.uuidServices);
          resolve(res);
        },
        fail: (err) => {
          console.error("获取服务失败", err);
          reject(err);
        },
      });
    });
  }

  // 获取蓝牙设备特征值
  async getCharacteristics() {
    if (!this.deviceId || !this.uuidServices)
      throw new Error("未连接蓝牙设备或未获取服务");

    const isHarmony = await this.isHarmonyOS();

    return new Promise((resolve, reject) => {
      uni.getBLEDeviceCharacteristics({
        deviceId: this.deviceId,
        serviceId: this.uuidServices,
        success: (res) => {
          console.log("获取特征值成功", res);

          if (isHarmony) {
            // 鸿蒙特殊处理：固定使用索引，忽略属性
            this.writeCharacteristicId = res.characteristics[0].uuid;
            this.characteristicId =
              res.characteristics[1]?.uuid || res.characteristics[0].uuid;
          } else {
            // iOS/Android 正常处理：基于属性选择
            let writeCharId = "";
            let notifyCharId = "";

            res.characteristics.forEach((char) => {
              if (char.properties.write || char.properties.writeNoResponse) {
                writeCharId = char.uuid;
              }
              if (char.properties.notify || char.properties.indicate) {
                notifyCharId = char.uuid;
              }
            });

            this.writeCharacteristicId =
              writeCharId || res.characteristics[0].uuid;
            this.characteristicId =
              notifyCharId ||
              res.characteristics[1]?.uuid ||
              res.characteristics[0].uuid;
          }

          uni.setStorageSync(
            "writeCharacteristicId",
            this.writeCharacteristicId,
          );
          uni.setStorageSync("characteristicId", this.characteristicId);
          resolve(res);
        },
        fail: (err) => {
          console.error("获取特征值失败", err.errMsg);
          reject(err);
        },
      });
    });
  }

  // 开启特征值变化监听
  async notify() {
    if (!this.deviceId || !this.uuidServices || !this.characteristicId) {
      throw new Error("未连接蓝牙设备或未获取服务/特征值");
    }

    const isHarmony = await this.isHarmonyOS();

    return new Promise((resolve, reject) => {
      console.log("服务UUID:", this.uuidServices);
      console.log("监听特征值:", this.characteristicId);

      uni.notifyBLECharacteristicValueChange({
        state: true,
        deviceId: this.deviceId,
        serviceId: this.uuidServices,
        characteristicId: this.characteristicId,
        success: (res) => {
          console.log("开启消息监听成功", res);
          resolve(res);
        },
        fail: (err) => {
          console.error("开启消息失败", err);
          if (isHarmony) {
            // 鸿蒙：自动重试
            console.log("鸿蒙模式：5秒后重试...");
            setTimeout(() => {
              this.notify();
            }, 5000);
          }
          reject(err);
        },
      });
    });
  }

  // 监听特征值变化
  listenValueChange(callback) {
    this.listenCallback = callback;
    uni.onBLECharacteristicValueChange((res) => {
      console.log("监听的值", res.value);

      var uint8Data = new Uint8Array(res.value);
      var dataView = new DataView(uint8Data.buffer);

      // 检查数据长度是否足够
      if (dataView.byteLength < 24) {
        console.info("数据长度不足");
        return;
      }

      // 解析6个32位输出值
      const output1 = dataView.getUint32(0, true); // 输出1
      const output2 = dataView.getUint32(4, true); // 输出2
      const output3 = dataView.getUint32(8, true); // 输出3
      const output4 = dataView.getUint32(12, true); // 输出4
      const output5 = dataView.getUint32(16, true); // 输出5
      const output6 = dataView.getUint32(20, true); // 输出6

      const parsedData = {
        output1,
        output2,
        output3,
        output4,
        output5,
        output6,
        rawData: res.value,
      };

      callback(parsedData);
    });
  }

  // 验证蓝牙设备是否正确
  validateBluetoothDevice(data) {
    // 检查数据是否包含所有必要的字段
    if (
      !data ||
      !data.output1 ||
      !data.output2 ||
      !data.output3 ||
      !data.output4 ||
      !data.output5 ||
      !data.output6
    ) {
      console.log("蓝牙设备数据格式不正确");
      return false;
    }

    // 检查数据范围是否合理
    const activationFlag = (data.output1 >> 6) & 0x07;
    const workConditionInt = (data.output1 >> 3) & 0x07;
    const mode = (data.output1 >> 1) & 0x03;

    // 验证激活标志位范围
    if (activationFlag < 0 || activationFlag > 7) {
      console.log("激活标志位范围不正确");
      return false;
    }

    // 验证工况标识范围
    if (workConditionInt < 0 || workConditionInt > 4) {
      console.log("工况标识范围不正确");
      return false;
    }

    // 验证模式范围
    if (mode < 0 || mode > 3) {
      console.log("模式范围不正确");
      return false;
    }

    console.log("蓝牙设备验证成功");
    return true;
  }

  // 获取当前连接的蓝牙设备名称
  getConnectedDeviceName() {
    return this.scanName;
  }

  // 发送数据
  async sendData(data) {
    if (!this.deviceId || !this.uuidServices || !this.writeCharacteristicId) {
      throw new Error("未连接蓝牙设备或未获取服务/特征值");
    }

    return new Promise((resolve, reject) => {
      uni.writeBLECharacteristicValue({
        deviceId: this.deviceId,
        serviceId: this.uuidServices,
        characteristicId: this.writeCharacteristicId,
        value: data,
        success: (res) => {
          console.log("发送数据成功", res);
          resolve(res);
        },
        fail: (err) => {
          console.error("发送数据失败", err);
          reject(err);
        },
      });
    });
  }

  // 获取蓝牙信号强度
  async getRSSI() {
    if (!this.deviceId) throw new Error("未连接蓝牙设备");

    return new Promise((resolve, reject) => {
      uni.getBLEDeviceRSSI({
        deviceId: this.deviceId,
        success: (res) => {
          console.log("蓝牙强度", res);
          resolve(res.RSSI);
        },
        fail: (err) => {
          console.error("获取设备 RSSI 失败:", err);
          reject(err);
        },
      });
    });
  }

  // 判断是否为鸿蒙系统
  async isHarmonyOS() {
    return new Promise((resolve) => {
      // #ifdef MP-HARMONY
      resolve(true);
      return;
      // #endif

      // #ifndef MP-HARMONY
      uni.getSystemInfo({
        success: (res) => {
          const isHarmony =
            res.system.includes("Harmony") ||
            res.platform === "harmony" ||
            (res.brand === "huawei" && res.system.includes("6.0"));
          resolve(isHarmony);
        },
        fail: () => resolve(false),
      });
      // #endif
    });
  }

  // 解析蓝牙数据
  parseBluetoothData(data) {
    const { output1, output2, output3, output4, output5, output6 } = data;

    // 输出1解析
    const drawStrength = (output1 >> 28) & 0x0f; // 拉压强度 (1-9)
    const rearSuspension = (output1 >> 24) & 0x0f; // 后悬架强度 (1-9)
    const rollStrength = (output1 >> 20) & 0x0f; // 侧倾强度 (1-9)
    const frontSuspension = (output1 >> 16) & 0x0f; // 前悬架强度 (1-9)
    const activationFlag = (output1 >> 6) & 0x07; // 激活标志位 (0-7)
    const workConditionInt = (output1 >> 3) & 0x07; // 工况标识 (0-4)
    const mode = (output1 >> 1) & 0x03; // 当前模式反馈 (0-3)

    // 工况
    let workCondition = "";
    switch (workConditionInt) {
      case 0:
        workCondition = "bump"; // 颠簸
        break;
      case 1:
        workCondition = "turnright"; // 右转
        break;
      case 2:
        workCondition = "carstop"; // 停车
        break;
      case 3:
        workCondition = "turnleft"; // 左转
        break;
      case 4:
        workCondition = "highspeed"; // 高速
        break;
      default:
        workCondition = "unknown";
    }

    // 输出2解析 - G值
    const gxRaw = (output2 >> 16) & 0xffff; // X轴加速度原始值 (0-1000)
    const gyRaw = output2 & 0xffff; // Y轴加速度原始值 (0-1000)
    const G = {
      GX: (gxRaw - 500) / 1000, // 实际G值
      GY: (gyRaw - 500) / 1000, // 实际G值
    };

    // 输出3解析 - 前悬架阻尼
    const FLCompress = (output3 >> 24) & 0xff; // 左前压缩阻尼 (0-100)
    const FLDraw = (output3 >> 16) & 0xff; // 左前复原阻尼 (0-100)
    const FRCompress = (output3 >> 8) & 0xff; // 右前压缩阻尼 (0-100)
    const FRDraw = output3 & 0xff; // 右前复原阻尼 (0-100)

    // 输出4解析 - 后悬架阻尼
    const RLCompress = (output4 >> 24) & 0xff; // 左后压缩阻尼 (0-100)
    const RLDraw = (output4 >> 16) & 0xff; // 左后拉伸阻尼 (0-100)
    const RRCompress = (output4 >> 8) & 0xff; // 右后压缩阻尼 (0-100)
    const RRDraw = output4 & 0xff; // 右后拉伸阻尼 (0-100)

    // 阻尼设定
    const DC = {
      FLCompress,
      FLDraw,
      FRCompress,
      FRDraw,
      RLCompress,
      RLDraw,
      RRCompress,
      RRDraw,
    };

    // 输出5解析 - 垂向加速度
    const springAccRaw = (output5 >> 16) & 0xffff; // 簧下垂向加速度原始值 (0-1000)
    const bodyAccRaw = output5 & 0xffff; // 车身垂向加速度原始值 (0-1000)
    const verticalAcc = {
      spring: (springAccRaw - 500) / 1000, // 簧下垂向加速度实际G值
      body: (bodyAccRaw - 500) / 1000, // 车身垂向加速度实际G值
    };

    // 输出6解析 - 车速
    const speed = output6 & 0xffff; // 车速 (0-200 km/h)

    return {
      DC,
      workCondition,
      workConditionCode: workConditionInt,
      mode,
      G,
      verticalAcc,
      speed,
      drawStrength,
      frontSuspension,
      rearSuspension,
      rollStrength,
      activationFlag,
    };
  }

  // 解析激活状态
  parseActivationStatus(data) {
    const { output1 } = data;
    // 激活标志位：位8~6（对应output1的bit6-8）
    let activationStatus = (output1 >> 6) & 0x07;
    console.log("激活状态:", activationStatus);
    return activationStatus;
  }

  // 重置蓝牙状态
  reset() {
    this.deviceId = "";
    this.scanName = "";
    this.uuidServices = "";
    this.characteristicId = "";
    this.writeCharacteristicId = "";
    this.connectedStatus = false;
    this.blueList = [];
    this.blueListFlag = false;
    this.scanFlag = false;
    this.listenCallback = null;

    uni.removeStorageSync("deviceId");
    uni.removeStorageSync("scanName");
    uni.removeStorageSync("uuidServices");
    uni.removeStorageSync("writeCharacteristicId");
    uni.removeStorageSync("characteristicId");
  }

  // 获取蓝牙连接状态
  getConnectedStatus() {
    return this.connectedStatus;
  }

  // 获取当前连接的设备信息
  getConnectedDevice() {
    return {
      deviceId: this.deviceId,
      name: this.scanName,
    };
  }

  // 检查蓝牙连接状态
  async checkConnectionStatus() {
    if (!this.deviceId) {
      this.connectedStatus = false;
      return false;
    }

    return new Promise((resolve) => {
      uni.getBLEDeviceState({
        success: (res) => {
          if (res.available && res.connected) {
            this.connectedStatus = true;
            resolve(true);
          } else {
            this.connectedStatus = false;
            resolve(false);
          }
        },
        fail: () => {
          this.connectedStatus = false;
          resolve(false);
        },
      });
    });
  }
}

// 导出单例
const bluetoothManager = new BluetoothManager();
export default bluetoothManager;
