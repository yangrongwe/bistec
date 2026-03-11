<template>
  <view class="page">
    <view class="container">
      <blue-modal
        :show="blueModalShow"
        :blueList="blueList"
        @unConnect="blueModalShow = false"
        @connect="handleBlueConnect"
      ></blue-modal>
      <!-- 蓝牙连接卡片 -->
      <view class="bluetooth-card">
        <!-- 发光效果 -->
        <view
          v-if="bluetoothManager.getConnectedStatus()"
          class="glow-effect"
        ></view>

        <view class="card-content">
          <view class="bluetooth-info">
            <view
              :class="[
                'bluetooth-icon',
                bluetoothManager.getConnectedStatus() ? 'connected' : '',
              ]"
            >
              <text class="icon">📡</text>
              <view
                v-if="bluetoothManager.getConnectedStatus()"
                class="ping-effect"
              ></view>
            </view>
            <view class="bluetooth-text">
              <text class="device-name">蓝牙设备</text>
              <view class="status-row">
                <view
                  :class="[
                    'status-dot',
                    bluetoothManager.getConnectedStatus() ? 'connected' : '',
                  ]"
                ></view>
                <text
                  :class="[
                    'status-text',
                    bluetoothManager.getConnectedStatus() ? 'connected' : '',
                  ]"
                >
                  {{
                    bluetoothManager.getConnectedStatus() ? "已连接" : "未连接"
                  }}
                </text>
              </view>
            </view>
          </view>
          <button
            @tap="toggleBluetooth"
            :class="[
              'btn-bluetooth',
              bluetoothManager.getConnectedStatus() ? 'disconnect' : 'connect',
            ]"
          >
            {{ bluetoothManager.getConnectedStatus() ? "断开" : "连接" }}
          </button>
        </view>
      </view>

      <!-- 激活码卡片 -->
      <view class="activation-card">
        <view class="card-inner">
          <!-- 激活码标题 -->
          <view class="title-section">
            <view class="title-line"></view>
            <text class="title-text">激活密钥</text>
            <view class="title-line"></view>
          </view>

          <!-- 激活码显示区 -->
          <view class="code-display">
            <view class="code-bg-gradient"></view>
            <view class="code-content">
              <text class="code-label">ACTIVATION CODE</text>
              <view class="code-input-container">
                <input
                  v-model="activationCodeParts[0]"
                  class="code-input"
                  maxlength="4"
                  @input="handleCodeInput(0)"
                  @keydown="handleCodeKeydown(0, $event)"
                  type="text"
                  placeholder="XXXX"
                  placeholder-style="color: #475569;"
                  :ref="`codeInput0`"
                />
                <view class="code-dash">-</view>
                <input
                  v-model="activationCodeParts[1]"
                  class="code-input"
                  maxlength="4"
                  @input="handleCodeInput(1)"
                  @keydown="handleCodeKeydown(1, $event)"
                  type="text"
                  placeholder="XXXX"
                  placeholder-style="color: #475569;"
                  :ref="`codeInput1`"
                />
                <view class="code-dash">-</view>
                <input
                  v-model="activationCodeParts[2]"
                  class="code-input"
                  maxlength="4"
                  @input="handleCodeInput(2)"
                  @keydown="handleCodeKeydown(2, $event)"
                  type="text"
                  placeholder="XXXX"
                  placeholder-style="color: #475569;"
                  :ref="`codeInput2`"
                />
                <view class="code-dash">-</view>
                <input
                  v-model="activationCodeParts[3]"
                  class="code-input"
                  maxlength="4"
                  @input="handleCodeInput(3)"
                  @keydown="handleCodeKeydown(3, $event)"
                  type="text"
                  placeholder="XXXX"
                  placeholder-style="color: #475569;"
                  :ref="`codeInput3`"
                />
              </view>
            </view>
          </view>

          <!-- 激活按钮 -->
          <button
            @tap="handleActivate"
            :disabled="!bluetoothManager.getConnectedStatus() || !hasValidData"
            :class="[
              'btn-activate',
              bluetoothManager.getConnectedStatus() && hasValidData
                ? 'enabled'
                : 'disabled',
            ]"
          >
            <view
              v-if="bluetoothManager.getConnectedStatus() && hasValidData"
              class="shimmer-effect"
            ></view>
            <text class="btn-text">激活设备</text>
          </button>
        </view>
      </view>

      <!-- 消息提示 -->
      <view v-if="message.text" :class="['message-card', message.type]">
        <view class="message-content">
          <view :class="['message-icon-box', message.type]">
            <uni-icons
              :type="message.type === 'error' ? 'help' : 'info'"
              size="32rpx"
              color="#ffffff"
            ></uni-icons>
          </view>
          <view class="message-text-box">
            <text :class="['message-text', message.type]">{{
              message.text
            }}</text>
          </view>
          <uni-icons
            @click="closeMessage"
            class="close-btn"
            type="close"
            size="28rpx"
            color="#64748b"
          ></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import BlueModal from "../../components/modal/BlueModal.vue";
import { sendData } from "../../util/sendInfo.js";
import bluetoothManager from "../../util/bluetoothManager.js";

export default {
  components: {
    BlueModal,
  },
  data() {
    return {
      activationCode: "",
      activationCodeParts: ["", "", "", ""],
      message: {
        type: null, // 'error' 或 'info'
        text: "",
      },
      blueModalShow: false,
      blueList: [],
      bluetoothManager: bluetoothManager,
      hasValidData: false, // 是否收到有效监听值
    };
  },
  watch: {
    blueModalShow(newVal) {
      if (newVal) {
        this.searchBluetoothDevices();
      }
    },
  },
  methods: {
    toggleBluetooth() {
      if (this.bluetoothManager.getConnectedStatus()) {
        // 断开蓝牙连接
        this.bluetoothManager
          .disconnect()
          .then(() => {
            console.log("蓝牙连接已断开");
            this.message = {
              type: "info",
              text: "蓝牙连接已断开",
            };
          })
          .catch((err) => {
            console.error("断开蓝牙连接失败", err);
            this.message = {
              type: "error",
              text: "断开蓝牙连接失败",
            };
          });
      } else {
        this.blueModalShow = true;
      }
    },
    async searchBluetoothDevices() {
      // 清空蓝牙列表
      this.blueList = [];

      try {
        // 初始化蓝牙模块
        await this.bluetoothManager.initBlue();
        console.log("蓝牙模块初始化成功");

        // 开始搜索蓝牙设备
        await this.bluetoothManager.startDiscovery();
        console.log("开始搜索蓝牙设备");

        // 监听蓝牙设备发现事件
        this.bluetoothManager.onBluetoothDeviceFound((res) => {
          const devices = res.devices;
          devices.forEach((device) => {
            // 过滤掉重复设备和没有名称的设备
            if (
              device.name &&
              !this.blueList.some((item) => item.deviceId === device.deviceId)
            ) {
              this.blueList.push(device);
            }
          });
        });
      } catch (err) {
        console.error("搜索蓝牙设备失败", err);
        this.message = {
          type: "error",
          text: "搜索蓝牙设备失败，请检查蓝牙是否开启",
        };
        this.blueModalShow = false;
      }
    },
    async handleBlueConnect(device) {
      try {
        // 停止搜索蓝牙设备
        await this.bluetoothManager.stopDiscovery();

        // 连接蓝牙设备
        await this.bluetoothManager.connect(device);
        console.log("蓝牙设备连接成功", device);

        this.blueModalShow = false;
        this.message = {
          type: "info",
          text: "蓝牙设备连接成功，正在验证设备...",
        };

        // 设置设备验证超时
        const validationTimeout = setTimeout(() => {
          // 如果超时还没有收到有效数据，显示错误信息
          if (this.bluetoothManager.getConnectedStatus()) {
            this.message = {
              type: "error",
              text: "未检测到有效设备数据，请检查设备是否正确",
            };
          }
        }, 5000); // 5秒超时

        // 连接成功后获取服务和特征值
        setTimeout(async () => {
          try {
            await this.bluetoothManager.getServices();
            await this.bluetoothManager.getCharacteristics();
            await this.bluetoothManager.notify();
            this.listenValueChange(validationTimeout);
          } catch (err) {
            console.error("获取服务或特征值失败", err);
            clearTimeout(validationTimeout);
            this.message = {
              type: "error",
              text: "蓝牙设备初始化失败",
            };
          }
        }, 500);
      } catch (err) {
        console.error("蓝牙设备连接失败", err);
        this.message = {
          type: "error",
          text: "蓝牙设备连接失败",
        };
      }
    },
    // 监听蓝牙设备值变化
    listenValueChange(validationTimeout) {
      this.bluetoothManager.listenValueChange((data) => {
        console.log("监听蓝牙设备传过来的值:", data);

        // 清除验证超时计时器
        clearTimeout(validationTimeout);

        // 验证蓝牙设备是否正确
        const isDeviceValid =
          this.bluetoothManager.validateBluetoothDevice(data);
        if (!isDeviceValid) {
          // 设备验证失败，显示错误信息
          this.message = {
            type: "error",
            text: "连接的蓝牙设备不正确",
          };
          this.hasValidData = false;
          return;
        }

        // 收到有效数据
        this.hasValidData = true;

        // 解析激活状态
        const activationStatus =
          this.bluetoothManager.parseActivationStatus(data);

        if (activationStatus === 1) {
          // 激活状态为1，加载loading并跳转到主页
          uni.showLoading({
            title: "加载中...",
            mask: true,
          });
          setTimeout(() => {
            uni.hideLoading();
            uni.navigateTo({
              url: "/pages/index/index",
            });
          }, 1000);
        } else if (activationStatus === 0) {
          // 激活状态为0，显示未激活提示
          this.message = {
            type: "error",
            text: "当前设备未激活请输入激活码激活",
          };
        }
      });
    },
    // 处理激活码输入
    handleCodeInput(index) {
      const currentPart = this.activationCodeParts[index];

      // 如果当前输入框已满，自动跳转到下一个
      if (currentPart.length === 4 && index < 3) {
        this.$nextTick(() => {
          // 在微信小程序中，通过ref获取输入框并设置焦点
          const nextInput = this.$refs[`codeInput${index + 1}`];
          if (nextInput && nextInput[0]) {
            nextInput[0].focus();
          }
        });
      }

      // 更新激活码
      this.updateActivationCode();
    },
    // 处理激活码删除
    handleCodeKeydown(index, event) {
      const currentPart = this.activationCodeParts[index];

      // 如果当前输入框为空且按下退格键，跳转到上一个输入框
      if (currentPart.length === 0 && index > 0 && event.key === "Backspace") {
        event.preventDefault();
        this.$nextTick(() => {
          // 在微信小程序中，通过ref获取输入框并设置焦点
          const prevInput = this.$refs[`codeInput${index - 1}`];
          if (prevInput && prevInput[0]) {
            prevInput[0].focus();
          }
        });
      }

      // 更新激活码
      this.updateActivationCode();
    },
    // 更新激活码
    updateActivationCode() {
      this.activationCode = this.activationCodeParts.join("-");
    },
    handleActivate() {
      if (this.bluetoothManager.getConnectedStatus()) {
        this.message = {
          type: "info",
          text: "激活成功！设备已就绪",
        };

        // 调用sendData方法，初始化所有参数为0，modeIndex为1
        const mockThat = {
          drawProgress: 0,
          gaugeList: [{ progress: 0 }, { progress: 0 }, { progress: 0 }],
          sceneListIndex: 0,
        };
        sendData(1, mockThat);

        // 跳转前关闭监听，避免重复监听
        try {
          uni.offBLECharacteristicValueChange();
          console.log("已关闭蓝牙监听");
        } catch (e) {
          console.error("关闭监听失败", e);
        }

        // 1秒后跳转到主页
        setTimeout(() => {
          uni.navigateTo({
            url: "/pages/index/index",
          });
        }, 1000);
      }
    },
    closeMessage() {
      this.message = { type: null, text: "" };
    },
  },
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%);
}

.nav-bar {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(6, 182, 212, 0.2);
  padding: 24rpx 32rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.nav-icon {
  font-size: 40rpx;
}

.nav-title {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.container {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  padding-top: 200rpx;
}

/* 蓝牙卡片 */
.bluetooth-card {
  background: linear-gradient(
    135deg,
    rgba(30, 41, 59, 0.8) 0%,
    rgba(15, 23, 42, 0.8) 100%
  );
  backdrop-filter: blur(8px);
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(6, 182, 212, 0.2);
  position: relative;
}

.glow-effect {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(6, 182, 212, 0.1) 0%,
    rgba(59, 130, 246, 0.1) 100%
  );
  animation: pulse 2s ease-in-out infinite;
}

.card-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
}

.bluetooth-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
  flex: 1;
}

.bluetooth-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  background: rgba(51, 65, 85, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.bluetooth-icon.connected {
  background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%);
  box-shadow: 0 8rpx 24rpx rgba(6, 182, 212, 0.5);
}

.bluetooth-img {
  width: 40rpx;
  height: 40rpx;
}

.icon {
  font-size: 36rpx;
}

.ping-effect {
  position: absolute;
  inset: 0;
  border-radius: 24rpx;
  background: rgba(34, 211, 238, 0.2);
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.bluetooth-text {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.device-name {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #64748b;
}

.status-dot.connected {
  background: #22d3ee;
  animation: pulse-dot 2s ease-in-out infinite;
}

.status-text {
  font-size: 24rpx;
  color: #94a3b8;
}

.status-text.connected {
  color: #22d3ee;
}

.btn-bluetooth {
  padding: 16rpx 36rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
  border: none;
  transition: all 0.3s;
}

.btn-bluetooth.connect {
  background: linear-gradient(90deg, #06b6d4 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(6, 182, 212, 0.3);
}

.btn-bluetooth.disconnect {
  background: #334155;
  color: #cbd5e1;
  border: 1px solid #475569;
}

/* 警告卡片 */
.warning-card {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  backdrop-filter: blur(8px);
}

.warning-icon-box {
  padding: 16rpx;
  border-radius: 16rpx;
  background: rgba(245, 158, 11, 0.2);
}

.warning-icon {
  font-size: 32rpx;
}

.warning-text {
  font-size: 28rpx;
  color: #fcd34d;
  flex: 1;
}

/* 激活码卡片 */
.activation-card {
  background: linear-gradient(
    135deg,
    rgba(30, 41, 59, 0.8) 0%,
    rgba(15, 23, 42, 0.8) 100%
  );
  backdrop-filter: blur(8px);
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(6, 182, 212, 0.2);
}

.card-inner {
  padding: 40rpx;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.title-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(6, 182, 212, 0.5) 50%,
    transparent 100%
  );
}

.title-text {
  font-size: 24rpx;
  color: #22d3ee;
  font-weight: 500;
  letter-spacing: 2rpx;
  text-transform: uppercase;
}

.code-display {
  margin-bottom: 48rpx;
  background: linear-gradient(
    135deg,
    rgba(30, 41, 59, 0.8) 0%,
    rgba(15, 23, 42, 0.8) 100%
  );
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 24rpx;
  padding: 40rpx 20rpx;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.code-bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(6, 182, 212, 0.05) 0%,
    transparent 50%,
    rgba(59, 130, 246, 0.05) 100%
  );
}

.code-content {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.code-label {
  font-size: 24rpx;
  color: #94a3b8;
}

.code-input-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 20rpx;
  flex-wrap: nowrap;
}

.code-input {
  width: 120rpx;
  height: 60rpx;
  font-size: 32rpx;
  font-family: "Courier New", monospace;
  color: #22d3ee;
  font-weight: bold;
  text-shadow: 0 0 20rpx rgba(34, 211, 238, 0.5);
  background: transparent;
  border: 2px solid rgba(6, 182, 212, 0.3);
  border-radius: 12rpx;
  text-align: center;
  outline: none;
  padding: 0;
  transition: all 0.3s ease;
}

.code-input:focus {
  border-color: #22d3ee;
  box-shadow: 0 0 20rpx rgba(34, 211, 238, 0.5);
}

.code-input::placeholder {
  color: #475569;
  font-weight: normal;
  text-shadow: none;
}

.code-dash {
  font-size: 32rpx;
  color: #22d3ee;
  font-weight: bold;
  text-shadow: 0 0 20rpx rgba(34, 211, 238, 0.5);
}

.btn-activate {
  width: 100%;
  padding: 32rpx;
  border-radius: 24rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.btn-activate.enabled {
  background: linear-gradient(90deg, #06b6d4 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(6, 182, 212, 0.3);
}

.btn-activate.disabled {
  background: rgba(30, 41, 59, 0.5);
  color: #475569;
  border: 1px solid rgba(51, 65, 85, 0.5);
}

.shimmer-effect {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  animation: shimmer 2s infinite;
}

.btn-text {
  position: relative;
  letter-spacing: 2rpx;
}

/* 消息卡片 */
.message-card {
  border-radius: 24rpx;
  overflow: hidden;
  backdrop-filter: blur(8px);
  border: 1px solid;
}

.message-card.error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.message-card.info {
  background: rgba(6, 182, 212, 0.1);
  border-color: rgba(6, 182, 212, 0.3);
}

.message-content {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  padding: 32rpx;
}

.message-icon-box {
  padding: 16rpx;
  border-radius: 16rpx;
}

.message-icon-box.error {
  background: rgba(239, 68, 68, 0.2);
}

.message-icon-box.info {
  background: rgba(6, 182, 212, 0.2);
}

.message-icon {
  font-size: 32rpx;
}

.message-text-box {
  flex: 1;
}

.message-text {
  font-size: 28rpx;
  font-weight: 500;
}

.message-text.error {
  color: #fca5a5;
}

.message-text.info {
  color: #67e8f9;
}

.close-btn {
  color: #64748b;
  font-size: 32rpx;
  padding: 0 8rpx;
  transition: color 0.3s;
}

/* 动画 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
