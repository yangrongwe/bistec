<template>
  <view class="bluetooth-content-box">
    <image
      v-for="(item, index) in urls"
      :key="index"
      :src="item"
      mode=""
      style="width: 0px; height: 0px; opacity: 0"
    ></image>
    <view class="header bis-flex" :style="{ height: totalHeight + 'px' }">
      <view>ADC电控主动减振</view>
      <uni-icons
        type="scan"
        size="20"
        color="white"
        style="margin-top: 8rpx; margin-left: 10rpx"
        @click="resetScan"
      ></uni-icons>
    </view>
    <view class="main">
      <blueModal
        :show="blueModalShow"
        :blueList="blueList"
        @unConnect="unConnect"
        @connect="blueConnect"
      ></blueModal>
      <modal
        :show="modalShow"
        @showChange="showChange"
        @modalScan="modalScan"
      ></modal>
      <img
        class="car-icon-img"
        :src="
          'https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/' +
          workCondition +
          '.png'
        "
        alt=""
      />
      <img
        class="bluetooth-signal-img"
        :src="bluetoothSignal"
        alt=""
        srcset=""
        @click="initBlueModal"
      />
      <view class="car-box">
        <!-- <img class="car-img" src="https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/car.png" alt=""> -->
        <img
          class="disable-img"
          src="../../static/backImage/zuni_disable.png"
          alt=""
        />
        <view
          :style="{ left: 366 + G.GX + 'rpx', top: 290 + G.GY + 'rpx' }"
          class="center-point"
        ></view>
      </view>
      <!-- <uni-icons class="phone-icon" type="phone" color="#0c66eb" size="30" @click="showChange(true)"></uni-icons> -->
      <bluetooth-signal
        class="signal-top left"
        :first="DC.FLCompress"
        :second="DC.FLDraw"
      ></bluetooth-signal>
      <bluetooth-signal
        class="signal-top right"
        :right="true"
        :first="DC.FRDraw"
        :second="DC.FRCompress"
      ></bluetooth-signal>
      <bluetooth-signal
        class="signal-bottom left"
        :first="DC.RLCompress"
        :second="DC.RLDraw"
      ></bluetooth-signal>
      <bluetooth-signal
        class="signal-bottom right"
        :right="true"
        :first="DC.RRDraw"
        :second="DC.RRCompress"
      ></bluetooth-signal>
    </view>
  </view>
</template>

<script>
import BluetoothSignal from "../bluetoothSignal/BluetoothSignal.vue";
import Modal from "@/components/modal/Modal.vue";
import BlueModal from "@/components/modal/BlueModal.vue";
import store from "../../store";
import bluetoothManager from "../../util/bluetoothManager.js";
export default {
  name: "BluetoothContent",
  data() {
    return {
      blueModalShow: false,
      blueList: [],
      blueListFlag: false,

      scanFlag: false,

      isShow: this.$store.state.isShow,
      connectedStatus: false,
      scanName: uni.getStorageSync("scanName") || "",
      currentMode: uni.getStorageSync("currentMode")
        ? parseInt(uni.getStorageSync("currentMode"))
        : 0,
      bluetoothSignal:
        "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/bluetooth_1.png",
      modalShow: false,
      system: [],
      menu: [],
      statusBarHeight: 0, //状态栏的高度
      navigatorHeight: 0, //导航栏高度
      menuHeight: 0, //胶囊高度
      menuTop: 0, //胶囊与顶部的距离
      totalHeight: 0, //总高度
      blueDeviceList: [],
      deviceId: uni.getStorageSync("deviceId") || "",
      uuidServices: "",
      characteristicId: "",
      G: {
        GX: 0,
        GY: 0,
      },
      DC: {
        FLCompress: 0,
        FLDraw: 0,
        FRCompress: 0,
        FRDraw: 0,
        RLCompress: 0,
        RLDraw: 0,
        RRCompress: 0,
        RRDraw: 0,
      },
      workCondition: "cardrive",
      workConditionCode: 0,
      bluetoothCount: 0,
      urls: [
        //预加载图片地址
        "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/backImage/comfortBack.png",
        "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/backImage/autoBack.png",
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
        [0, 0],
      ],
    };
  },
  props: ["launch", "isOk"],
  watch: {
    isOk(val) {
      if (val && !this.scanFlag) {
        if (uni.getStorageSync("deviceId")) {
          this.scan();
        } else {
          this.modalShow = true;
        }
      } else {
        if (val) {
          this.scanFlag = false;
        }
      }
    },
  },
  components: {
    "bluetooth-signal": BluetoothSignal,
    modal: Modal,
    blueModal: BlueModal,
  },
  methods: {
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
    },

    unConnect() {
      this.blueModalShow = false;
    },
    blueConnect(data) {
      this.connect(data);
    },
    async initBlueModal() {
      this.$set(this, "blueList", []);
      // 设置标志为阻止扫描
      this.blueListFlag = true;

      try {
        const devices = await new Promise((resolve) => {
          uni.getConnectedBluetoothDevices({
            success: function (res) {
              console.log("存在蓝牙设备集合 res.devices", res.devices);
              resolve(res.devices);
            },
            fail: function (err) {
              console.error("获取连接设备失败：", err);
              resolve([]);
            },
          });
        });

        if (devices.length > 0) {
          for (const device of devices) {
            console.log("设备ID:", device.deviceId);
            console.log("设备名称:", device.name);
            try {
              await bluetoothManager.disconnect();
              console.log("蓝牙连接已断开1");
              this.connectedStatus = false;
            } catch (err) {
              console.error("断开蓝牙连接失败", err);
            }
          }
        } else {
          try {
            await bluetoothManager.disconnect();
            console.log("蓝牙连接已断开1---");
            this.connectedStatus = false;
          } catch (err) {
            console.error("断开蓝牙连接失败-----", err);
          }
          console.log("当前没有连接的蓝牙设备");
        }

        await this.initBlue();
      } catch (err) {
        console.error("初始化蓝牙模态框失败", err);
        await this.initBlue();
      }

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
    async resetScan() {
      this.blueListFlag = false;
      if (uni.getStorageSync("deviceId")) {
        try {
          await bluetoothManager.disconnect();
          console.log("蓝牙连接已断开1");
          if (uni.getStorageSync("deviceId")) {
            bluetoothManager.reset();
            this.deviceId = "";
            this.scanName = "";
          }
          this.connectedStatus = false;
        } catch (err) {
          console.error("断开蓝牙连接失败", err);
        }
      }
      await this.initBlue();
    },
    modalScan(bool) {
      this.modalShow = bool;
      this.scan();
    },
    showChange(bool) {
      this.modalShow = bool;
    },
    // 【1】初始化蓝牙
    async initBlue() {
      this.bluetoothSignal =
        "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/bluetooth_1.png";

      try {
        // 初始化蓝牙模块
        await bluetoothManager.initBlue();
        console.log("初始化蓝牙成功");

        // 初次加载或者点击蓝牙图标
        console.log("”this.blueListFlag", this.blueListFlag);
        if (!this.blueListFlag) {
          if (!uni.getStorageSync("deviceId")) {
            this.scanFlag = true;
            uni.scanCode({
              success: async (res) => {
                this.scanName = res.result;
                // 寻找对应名字的蓝牙设备
                await this.discovery();
              },
            });
          } else {
            console.log(
              "uni.getStorageSync scanName",
              uni.getStorageSync("scanName"),
            );
            this.scanName = uni.getStorageSync("scanName");
            await this.discovery();
          }
        } else {
          // 不指定名字
          await this.discovery();
        }
      } catch (err) {
        console.log("初始化蓝牙失败", err);
        if (err.errCode == 10001) {
          uni.showToast({
            icon: "error",
            title: "请打开蓝牙",
            duration: 2000,
          });
        }
        setTimeout(() => {
          this.initBlue();
        }, 1000);
      }
    },
    // 【2】开始搜寻附近设备
    async discovery() {
      try {
        // 开始搜索蓝牙设备
        await bluetoothManager.startDiscovery();
        console.log("开始搜索");

        // 开启监听回调
        bluetoothManager.onBluetoothDeviceFound((res) => {
          this.found(res);
        });
      } catch (err) {
        console.log("搜索失败");
        console.error(err);
      }
    },
    // 【3】找到新设备就触发该方法
    found(res) {
      // if (res.devices[0].name == 'BIS') {
      // 	this.blueDeviceList.push(res.devices[0]);
      // 	this.connect(res.devices[0]);
      // }
      // console.log('res.devices[0]', res.devices);
      // 找到扫描二维码对应的蓝牙
      // console.log("搜索后追加链接");
      if (!this.blueListFlag) {
        if (res.devices[0].name == this.scanName) {
          this.blueDeviceList.push(res.devices[0]);
          this.connect(res.devices[0]);
        }
      } else {
        // 把蓝牙填到list中
        let flag = true;
        this.blueList.map((item) => {
          if (item.name == res.devices[0].name) {
            flag = false;
          }
        });
        if (flag) {
          this.blueList.push(res.devices[0]);
        }
        // console.log("搜索后追加链接，this.blueList", this.blueList);
      }
    },
    // 【4】连接设备
    async connect(data) {
      try {
        this.blueModalShow = false;
        console.log(data);
        this.deviceId = data.deviceId;

        // 连接蓝牙设备
        await bluetoothManager.connect(data);
        console.log("连接成功");

        this.blueListFlag = false;
        this.connectedStatus = true;

        // 停止搜索
        await bluetoothManager.stopDiscovery();

        // 获取服务和特征值
        await bluetoothManager.getServices();
        await bluetoothManager.getCharacteristics();
        await bluetoothManager.notify();
        this.listenValueChange();

        uni.onBLEConnectionStateChange((res) => {
          if (!res.connected) {
            // 蓝牙断开连接，通知用户
            this.DC = {
              FLCompress: 0,
              FLDraw: 0,
              FRCompress: 0,
              FRDraw: 0,
              RLCompress: 0,
              RLDraw: 0,
              RRCompress: 0,
              RRDraw: 0,
            };
            this.bluetoothSignal =
              "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/bluetooth_1.png";
            uni.showToast({
              title: "蓝牙已断开",
              icon: "none",
              duration: 2000,
            });
          }
        });
      } catch (err) {
        console.log("连接失败");
        console.error(err);
      }
    },
    // 【4.1】重连设备
    async reconnect() {
      try {
        // 连接蓝牙设备
        await bluetoothManager.connect({
          deviceId: uni.getStorageSync("deviceId"),
        });
        console.log("连接成功");

        // 获取服务和特征值
        await bluetoothManager.getServices();
        await bluetoothManager.getCharacteristics();
        await bluetoothManager.notify();
        this.listenValueChange();
      } catch (err) {
        console.log("重新连接失败");
        console.error(err);
      }
    },
    // 【5】停止搜索
    stopDiscovery() {
      uni.stopBluetoothDevicesDiscovery({
        success(res) {
          console.log("停止成功");
          console.log(res);
        },
        fail(err) {
          console.log("停止失败");
          console.error(err);
        },
      });
    },
    // 【6】获取服务（兼容版）
    async getServices() {
      const that = this;
      const isHarmony = await this.isHarmonyOS();

      uni.getBLEDeviceServices({
        deviceId: uni.getStorageSync("deviceId"),
        success(res) {
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
            that.uuidServices = targetService
              ? targetService.uuid
              : res.services[0].uuid;
          } else {
            // iOS/Android：直接用第一个
            that.uuidServices = res.services[0].uuid;
          }

          uni.setStorageSync("uuidServices", that.uuidServices);
          that.getCharacteristics();
        },
        fail(err) {
          console.error("获取服务失败", err);
        },
      });
    },
    // 【7】获取特征值（兼容版）
    async getCharacteristics() {
      const that = this;
      const isHarmony = await this.isHarmonyOS();

      uni.getBLEDeviceCharacteristics({
        deviceId: uni.getStorageSync("deviceId"),
        serviceId: uni.getStorageSync("uuidServices"),
        success(res) {
          console.log("获取特征值成功", res);

          if (isHarmony) {
            // 鸿蒙特殊处理：固定使用索引，忽略属性
            uni.setStorageSync(
              "writeCharacteristicId",
              res.characteristics[0].uuid,
            );
            that.characteristicId =
              res.characteristics[1]?.uuid || res.characteristics[0].uuid;
            uni.setStorageSync("characteristicId", that.characteristicId);
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

            uni.setStorageSync(
              "writeCharacteristicId",
              writeCharId || res.characteristics[0].uuid,
            );
            that.characteristicId =
              notifyCharId ||
              res.characteristics[1]?.uuid ||
              res.characteristics[0].uuid;
            uni.setStorageSync("characteristicId", that.characteristicId);
          }

          setTimeout(() => {
            that.notify();
          }, 1000);
        },
        fail(err) {
          console.error("获取特征值失败", err.errMsg);
        },
      });
    },
    // 【8】开启消息监听（兼容版）
    async notify() {
      const that = this;
      const isHarmony = await this.isHarmonyOS();

      console.log("服务UUID:", this.uuidServices);
      console.log("监听特征值:", this.characteristicId);

      uni.notifyBLECharacteristicValueChange({
        state: true,
        deviceId: this.deviceId,
        serviceId: this.uuidServices,
        characteristicId: this.characteristicId,
        success(res) {
          console.log("开启消息监听成功", res);
          that.listenValueChange();
        },
        fail(err) {
          console.error("开启消息失败", err);
          if (isHarmony) {
            // 鸿蒙：自动重试
            console.log("鸿蒙模式：5秒后重试...");
            setTimeout(() => {
              that.notify();
            }, 5000);
          }
        },
      });
    },

    // 将16进制的内容转成我们看得懂的字符串内容
    hexCharCodeToStr(hexCharCodeStr) {
      var trimedStr = hexCharCodeStr.trim();
      var rawStr =
        trimedStr.substr(0, 2).toLowerCase() === "0x"
          ? trimedStr.substr(2)
          : trimedStr;
      var len = rawStr.length;
      if (len % 2 !== 0) {
        alert("存在非法字符!");
        return "";
      }
      var curCharCode;
      var resultStr = [];
      for (var i = 0; i < len; i = i + 2) {
        curCharCode = parseInt(rawStr.substr(i, 2), 16);
        resultStr.push(String.fromCharCode(curCharCode));
      }
      return resultStr.join("");
    },
    // 【9】监听消息变化
    listenValueChange() {
      const that = this;
      console.log("onBLECharacteristicValueChange已经开启监听");

      bluetoothManager.listenValueChange((data) => {
        console.log("监听的值", data);

        // 解析蓝牙数据
        const parsedData = bluetoothManager.parseBluetoothData(data);

        // 阻尼设定
        that.DC = parsedData.DC;

        // 工况
        if (that.workConditionCode != parsedData.workConditionCode) {
          that.workConditionCode = parsedData.workConditionCode;
          that.workCondition = parsedData.workCondition;
        }

        // 模式反馈
        const mode = parsedData.mode;
        if (that.currentMode != mode) {
          store.commit("changeSettingStatus", mode);
          uni.setStorageSync("currentMode", that.currentMode);
        }
        that.currentMode = mode;

        // GX GY
        that.G = parsedData.G;

        // 其他参数
        const { frontSuspension, heel, behindSuspension, DCValue } = parsedData;

        uni.setStorageSync(
          "setting",
          JSON.stringify({
            GX: parsedData.G.GX + 100,
            GY: parsedData.G.GY + 100,
            frontSuspension,
            heel,
            behindSuspension,
            DC: DCValue,
          }),
        );

        if (that.bluetoothCount % 100 == 0) {
          // 每隔1s监测蓝牙信号强度
          bluetoothManager
            .getRSSI()
            .then((rssi) => {
              console.log("蓝牙强度", rssi);
              if (rssi < 0 && rssi >= -50) {
                that.bluetoothSignal =
                  "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/bluetooth_5.png";
              } else if (rssi < -50 && rssi >= -70) {
                that.bluetoothSignal =
                  "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/bluetooth_4.png";
              } else if (rssi < -70 && rssi >= -80) {
                that.bluetoothSignal =
                  "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/bluetooth_3.png";
              } else if (rssi < -80 && rssi >= -90) {
                that.bluetoothSignal =
                  "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/bluetooth_2.png";
              } else if (rssi < -90) {
                uni.showToast({
                  title: "蓝牙信号弱",
                  duration: 1000,
                });
                that.bluetoothSignal =
                  "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/bluetooth_1.png";
              }
            })
            .catch((err) => {
              that.bluetoothSignal =
                "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/bluetooth_1.png";
              console.error("获取设备 RSSI 失败:", err);
            });
        }
        that.bluetoothCount++;
      });
    },
    //2进制字符串补充至32位
    addToInt32(str) {
      for (let i = str.length; i < 32; i++) {
        str = "0" + str;
      }
      return str;
    },
    //值变化限制
    changeLimit(newval, old, maxlimit, max, minLimit = 0) {
      if (newval > old) {
        if (newval > old + maxlimit) {
          if (old + maxlimit >= max) {
            newval = max;
          } else {
            newval = old + maxlimit;
          }
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
    },
  },

  created() {
    //获取系统信息
    uni.getSystemInfo({
      success: (res) => {
        this.system = res;
      },
    });

    //获取胶囊信息
    this.menu = uni.getMenuButtonBoundingClientRect();

    //计算组件高度
    this.statusBarHeight = this.system.statusBarHeight;
    this.menuHeight = this.menu.height;
    this.menuTop = this.menu.top;
    this.navigatorHeight =
      (this.menu.top - this.system.statusBarHeight) * 2 + this.menu.height;
    this.totalHeight = this.statusBarHeight + this.navigatorHeight;

    if (this.isOk) {
      console.log(
        "==========================created================",
        this.isOk,
      );
      if (uni.getStorageSync("deviceId")) {
        this.scan();
      } else {
        this.modalShow = true;
      }
    }
  },
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
