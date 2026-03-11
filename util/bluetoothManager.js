// 蓝牙管理工具类
class BluetoothManager {
  constructor() {
    this.deviceId = uni.getStorageSync('deviceId') || '';
    this.scanName = uni.getStorageSync('scanName') || '';
    this.uuidServices = '';
    this.characteristicId = '';
    this.writeCharacteristicId = '';
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
          console.log('初始化蓝牙成功');
          resolve(res);
        },
        fail: (err) => {
          console.log('初始化蓝牙失败', err);
          if (err.errCode == 10001) {
            uni.showToast({
              icon: 'error',
              title: '请打开蓝牙',
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
          console.log('开始搜索蓝牙设备');
          resolve(res);
        },
        fail: (err) => {
          console.log('搜索蓝牙设备失败');
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
          console.log('停止搜索蓝牙设备成功');
          resolve(res);
        },
        fail: (err) => {
          console.log('停止搜索蓝牙设备失败');
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
          console.log('连接蓝牙设备成功');
          uni.setStorageSync('deviceId', device.deviceId);
          if (this.blueListFlag) {
            uni.setStorageSync('scanName', device.name);
            this.scanName = device.name;
          }
          this.blueListFlag = false;
          this.connectedStatus = true;
          resolve(res);
        },
        fail: (err) => {
          console.log('连接蓝牙设备失败');
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
          console.log('断开蓝牙连接成功');
          this.connectedStatus = false;
          resolve(res);
        },
        fail: (err) => {
          console.error('断开蓝牙连接失败', err);
          reject(err);
        },
      });
    });
  }

  // 获取蓝牙设备服务
  async getServices() {
    if (!this.deviceId) throw new Error('未连接蓝牙设备');
    
    const isHarmony = await this.isHarmonyOS();
    
    return new Promise((resolve, reject) => {
      uni.getBLEDeviceServices({
        deviceId: this.deviceId,
        success: (res) => {
          console.log('获取服务成功', res.services);
          
          if (isHarmony && res.services.length > 1) {
            // 鸿蒙：尝试找 FFB0 服务
            let targetService = null;
            for (let i = 0; i < res.services.length; i++) {
              if (res.services[i].uuid.includes('FFB0')) {
                targetService = res.services[i];
                break;
              }
            }
            this.uuidServices = targetService ? targetService.uuid : res.services[0].uuid;
          } else {
            // iOS/Android：直接用第一个
            this.uuidServices = res.services[0].uuid;
          }
          
          uni.setStorageSync('uuidServices', this.uuidServices);
          resolve(res);
        },
        fail: (err) => {
          console.error('获取服务失败', err);
          reject(err);
        },
      });
    });
  }

  // 获取蓝牙设备特征值
  async getCharacteristics() {
    if (!this.deviceId || !this.uuidServices) throw new Error('未连接蓝牙设备或未获取服务');
    
    const isHarmony = await this.isHarmonyOS();
    
    return new Promise((resolve, reject) => {
      uni.getBLEDeviceCharacteristics({
        deviceId: this.deviceId,
        serviceId: this.uuidServices,
        success: (res) => {
          console.log('获取特征值成功', res);
          
          if (isHarmony) {
            // 鸿蒙特殊处理：固定使用索引，忽略属性
            this.writeCharacteristicId = res.characteristics[0].uuid;
            this.characteristicId = res.characteristics[1]?.uuid || res.characteristics[0].uuid;
          } else {
            // iOS/Android 正常处理：基于属性选择
            let writeCharId = '';
            let notifyCharId = '';
            
            res.characteristics.forEach(char => {
              if (char.properties.write || char.properties.writeNoResponse) {
                writeCharId = char.uuid;
              }
              if (char.properties.notify || char.properties.indicate) {
                notifyCharId = char.uuid;
              }
            });
            
            this.writeCharacteristicId = writeCharId || res.characteristics[0].uuid;
            this.characteristicId = notifyCharId || res.characteristics[1]?.uuid || res.characteristics[0].uuid;
          }
          
          uni.setStorageSync('writeCharacteristicId', this.writeCharacteristicId);
          uni.setStorageSync('characteristicId', this.characteristicId);
          resolve(res);
        },
        fail: (err) => {
          console.error('获取特征值失败', err.errMsg);
          reject(err);
        },
      });
    });
  }

  // 开启特征值变化监听
  async notify() {
    if (!this.deviceId || !this.uuidServices || !this.characteristicId) {
      throw new Error('未连接蓝牙设备或未获取服务/特征值');
    }
    
    const isHarmony = await this.isHarmonyOS();
    
    return new Promise((resolve, reject) => {
      console.log('服务UUID:', this.uuidServices);
      console.log('监听特征值:', this.characteristicId);
      
      uni.notifyBLECharacteristicValueChange({
        state: true,
        deviceId: this.deviceId,
        serviceId: this.uuidServices,
        characteristicId: this.characteristicId,
        success: (res) => {
          console.log('开启消息监听成功', res);
          resolve(res);
        },
        fail: (err) => {
          console.error('开启消息失败', err);
          if (isHarmony) {
            // 鸿蒙：自动重试
            console.log('鸿蒙模式：5秒后重试...');
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
        
        const data = {
          firstCode,
          secondCode,
          thirdCode,
          begin,
          end,
          rawData: res.value
        };
        
        callback(data);
      } else {
        console.info('数据格式异常');
      }
    });
  }

  // 发送数据
  async sendData(data) {
    if (!this.deviceId || !this.uuidServices || !this.writeCharacteristicId) {
      throw new Error('未连接蓝牙设备或未获取服务/特征值');
    }
    
    return new Promise((resolve, reject) => {
      uni.writeBLECharacteristicValue({
        deviceId: this.deviceId,
        serviceId: this.uuidServices,
        characteristicId: this.writeCharacteristicId,
        value: data,
        success: (res) => {
          console.log('发送数据成功', res);
          resolve(res);
        },
        fail: (err) => {
          console.error('发送数据失败', err);
          reject(err);
        },
      });
    });
  }

  // 获取蓝牙信号强度
  async getRSSI() {
    if (!this.deviceId) throw new Error('未连接蓝牙设备');
    
    return new Promise((resolve, reject) => {
      uni.getBLEDeviceRSSI({
        deviceId: this.deviceId,
        success: (res) => {
          console.log('蓝牙强度', res);
          resolve(res.RSSI);
        },
        fail: (err) => {
          console.error('获取设备 RSSI 失败:', err);
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
          const isHarmony = res.system.includes('Harmony') || 
                            res.platform === 'harmony' ||
                            (res.brand === 'huawei' && res.system.includes('6.0'));
          resolve(isHarmony);
        },
        fail: () => resolve(false)
      });
      // #endif
    });
  }

  // 解析蓝牙数据
  parseBluetoothData(data) {
    const { firstCode, secondCode, thirdCode } = data;
    
    // 阻尼设定
    const DC = {
      FLCompress: (thirdCode >> 28) & 0x0f,
      FLDraw: (thirdCode >> 24) & 0x0f,
      FRCompress: (thirdCode >> 20) & 0x0f,
      FRDraw: (thirdCode >> 16) & 0x0f,
      RLCompress: (thirdCode >> 12) & 0x0f,
      RLDraw: (thirdCode >> 8) & 0x0f,
      RRCompress: (thirdCode >> 4) & 0x0f,
      RRDraw: (thirdCode >> 0) & 0x0f,
    };

    // 工况
    let workConditionInt = (firstCode >> 2) & 0x07;
    let workCondition = '';
    switch (workConditionInt) {
      case 0:
        workCondition = 'carbrake';
        break;
      case 1:
        workCondition = 'turnleft';
        break;
      case 2:
        workCondition = 'carstop';
        break;
      case 3:
        workCondition = 'turnright';
        break;
      case 4:
        workCondition = 'cardrive';
    }

    // 模式反馈
    const mode = (firstCode >> 0) & 0x03;

    // GX GY
    const GX = (secondCode >> 8) & 0xff;
    const GY = (secondCode >> 0) & 0xff;
    const G = { GX: GX - 100, GY: GY - 100 };

    // 其他参数
    const frontSuspension = (secondCode >> 16) & 0x0f;
    const heel = (secondCode >> 20) & 0x0f;
    const behindSuspension = (secondCode >> 24) & 0x0f;
    const DCValue = (secondCode >> 28) & 0x0f;

    return {
      DC,
      workCondition,
      workConditionCode: workConditionInt,
      mode,
      G,
      frontSuspension,
      heel,
      behindSuspension,
      DCValue
    };
  }

  // 解析激活状态
  parseActivationStatus(data) {
    const { firstCode } = data;
    // 判断5-7位是否为1（从0开始计数，第5-7位对应二进制位2-4）
    let activationStatus = (firstCode >> 2) & 0x07;
    console.log('激活状态:', activationStatus);
    return activationStatus;
  }

  // 重置蓝牙状态
  reset() {
    this.deviceId = '';
    this.scanName = '';
    this.uuidServices = '';
    this.characteristicId = '';
    this.writeCharacteristicId = '';
    this.connectedStatus = false;
    this.blueList = [];
    this.blueListFlag = false;
    this.scanFlag = false;
    this.listenCallback = null;
    
    uni.removeStorageSync('deviceId');
    uni.removeStorageSync('scanName');
    uni.removeStorageSync('uuidServices');
    uni.removeStorageSync('writeCharacteristicId');
    uni.removeStorageSync('characteristicId');
  }
}

// 导出单例
const bluetoothManager = new BluetoothManager();
export default bluetoothManager;
