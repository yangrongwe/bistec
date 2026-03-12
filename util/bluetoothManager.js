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

      // 检查数据长度是否足够（针头4字节 + 3个输出值12字节 + 针尾4字节 = 20字节）
      if (dataView.byteLength < 20) {
        console.info("数据长度不足");
        return;
      }

      // 验证针头 (FEFEFFFF)
      const header = dataView.getUint32(0, true);
      console.log("header",header)
      if (header !== 0xFEFEFFFF) {
        console.info("数据针头不正确");
        return;
      }

      // 验证针尾 (FFFFFEFE)
      const footer = dataView.getUint32(16, true);
      console.log("footer",footer)
      if (footer !== 0xFFFFFEFE) {
        console.info("数据针尾不正确");
        return;
      }

      // 解析3个32位输出值
      const output1 = dataView.getUint32(4, true); // 输出1：基础工况与模式控制
      const output2 = dataView.getUint32(8, true); // 输出2：悬架强度与 G 值参数
      const output3 = dataView.getUint32(12, true); // 输出3：四悬架阻尼参数

      const parsedData = {
        output1,
        output2,
        output3,
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
      data.output1 === undefined ||
      data.output2 === undefined ||
      data.output3 === undefined
    ) {
      console.log("蓝牙设备数据格式不正确");
      return false;
    }

    // 只验证数据针头针尾，不验证具体值范围
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
    const { output1, output2, output3 } = data;

    // 输出1解析 - 基础工况与模式控制
    const activationFlag = (output1 >> 6) & 0x07; // 激活标志位 (位8-6)
    const workConditionInt = (output1 >> 3) & 0x07; // 工况标识 (位5-3)
    const mode = (output1 >> 1) & 0x03; // 当前模式反馈 (位2-1)

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

    // 输出2解析 - 悬架强度与 G 值参数
    const drawStrength = (output2 >> 29) & 0x0f; // 拉压强度 (位32-29)
    const rearSuspension = (output2 >> 25) & 0x0f; // 后悬架强度 (位28-25)
    const rollStrength = (output2 >> 21) & 0x0f; // 侧倾强度 (位24-21)
    const frontSuspension = (output2 >> 17) & 0x0f; // 前悬架强度 (位20-17)
    const gxRaw = (output2 >> 9) & 0xff; // X轴加速度原始值 (位16-9, 0-200)
    const gyRaw = output2 & 0xff; // Y轴加速度原始值 (位8-1, 0-200)
    const G = {
      GX: (gxRaw - 100) / 100, // 实际G值 (当前G值/g×100+100)
      GY: (gyRaw - 100) / 100, // 实际G值 (当前G值/g×100+100)
    };

    // 输出3解析 - 四悬架阻尼参数
    const FLCompress = (output3 >> 29) & 0x0f; // FL压缩阻尼 (位32-29, 0-8)
    const FLDraw = (output3 >> 25) & 0x0f; // FL拉伸阻尼 (位28-25, 0-8)
    const FRCompress = (output3 >> 21) & 0x0f; // FR压缩阻尼 (位24-21, 0-8)
    const FRDraw = (output3 >> 17) & 0x0f; // FR拉伸阻尼 (位20-17, 0-8)
    const RLCompress = (output3 >> 13) & 0x0f; // RL压缩阻尼 (位16-13, 0-8)
    const RLDraw = (output3 >> 9) & 0x0f; // RL拉伸阻尼 (位12-9, 0-8)
    const RRCompress = (output3 >> 5) & 0x0f; // RR压缩阻尼 (位8-5, 0-8)
    const RRDraw = (output3 >> 1) & 0x0f; // RR拉伸阻尼 (位4-1, 0-8)

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

    return {
      DC,
      workCondition,
      workConditionCode: workConditionInt,
      mode,
      G,
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
