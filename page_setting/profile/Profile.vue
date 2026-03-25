<template>
    <view class="container">
        <view class="profile">
            <view class="header" :style="{ height: totalHeight + 'px' }">
                <uni-icons :style="{ top: backTop + 'px' }" class="back-icon" type="back" size="26" color="white"
                    @click="backToIndex"></uni-icons>
                <view :style="{ paddingTop: titleTop + 'px' }">ADC电控主动减振</view>
            </view>

            <view class="title">已绑定产品</view>
            <view class="list">
                <!-- 加载状态 -->
                <view v-if="loading" class="empty">加载中...</view>

                <!-- 错误提示 -->
                <view v-else-if="error" class="empty error">{{ error }}</view>

                <!-- 产品列表 -->
                <view v-else>
                    <view class="item" v-for="(p, i) in products" :key="p.id">
                        <view class="info">
                            <view class="row">
                                <text class="label">产品序列号</text>
                                <text class="value">{{ p.sn }}</text>
                            </view>
                            <view class="divider"></view>
                            <view class="row">
                                <text class="label">激活码</text>
                                <text class="value">{{ p.code }}</text>
                            </view>
                            <view class="divider"></view>
                            <view class="row">
                                <text class="label">激活时间</text>
                                <text class="value">{{ p.time }}</text>
                            </view>
                            <view class="divider"></view>
                            <view class="row">
                                <text class="label">蓝牙名称</text>
                                <text class="value">{{ p.bluetoothName || "未知" }}</text>
                            </view>
                            <view class="divider"></view>
                            <view class="row">
                                <text class="label">售后到期时间</text>
                                <text class="value">{{ p.warrantyExpiration || "未知" }}</text>
                            </view>
                        </view>
                        <view class="actions">
                            <button 
                                v-if="(p.deviceId === connectedDeviceId || p.bluetoothName === connectedDeviceName)"
                                class="unbind" 
                                @tap="unbind(i)"
                            >
                                取消激活
                            </button>
                        </view>
                    </view>
                    <view v-if="!products.length" class="empty">暂无绑定产品</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import bluetoothManager from "../../util/bluetoothManager.js";
import { sendData } from "../../util/sendInfo.js";
export default {
    name: "Profile",
    data() {
        return {
            system: [],
            menu: [],
            statusBarHeight: 0,
            navigatorHeight: 0,
            menuHeight: 0,
            menuTop: 0,
            totalHeight: 0,
            urls: [],
            backTop: 0,
            titleTop: 0,
            connectedDeviceName: "",
            connectedDeviceId: "",
            products: [],
            loading: true,
            error: "",
        };
    },
    methods: {
        backToIndex() {
            if (getCurrentPages().length > 1) {
                uni.navigateBack();
            } else {
                uni.switchTab({
                    url: "/pages/index/index",
                });
            }
        },
        // 获取产品数据
        getProducts() {
            this.loading = true;
            this.error = "";

            // 获取微信ID
            const wechatId = uni.getStorageSync("wechatId") || "";
            
            if (!wechatId) {
                this.error = "未获取到微信ID";
                this.products = [];
                this.loading = false;
                return;
            }

            console.log("开始请求产品数据，wechatId:", wechatId);

            // 调用API获取绑定产品
            uni.request({
                url: `https://www.bistec.cn/api/bound-products?wechatId=${wechatId}`,
                method: "GET",
                header: {
                    "content-type": "application/json"
                },
                success: (response) => {
                    console.log("API响应类型:", typeof response);
                    console.log("API响应:", response);
                    console.log("响应状态码:", response.statusCode);

                    // 检查响应对象是否有效
                    if (!response) {
                        console.error("响应对象为空");
                        this.error = "网络连接异常";
                        this.products = [];
                        return;
                    }

                    // 检查statusCode是否存在且为200
                    if (response.statusCode === 200) {
                        const result = response.data;
                        console.log("响应数据:", result);
                        
                        // 检查result是否直接是数组
                        if (Array.isArray(result)) {
                            console.log("响应数据直接是数组");
                            // 映射API返回的字段到组件需要的字段
                            this.products = result.map(item => ({
                                id: item.productId,
                                sn: item.serialNumber,
                                code: item.activationCode,
                                time: item.activationTime,
                                bluetoothName: item.bluetoothName,
                                deviceId: item.deviceId,
                                warrantyDays: item.warrantyDays,
                                warrantyExpiration: item.warrantyExpiration
                            }));
                            console.log("处理后的产品数据:", this.products);
                        } 
                        // 检查result.data是否是数组
                        else if (result && Array.isArray(result.data)) {
                            console.log("响应数据的data属性是数组");
                            // 映射API返回的字段到组件需要的字段
                            this.products = result.data.map(item => ({
                                id: item.productId,
                                sn: item.serialNumber,
                                code: item.activationCode,
                                time: item.activationTime,
                                bluetoothName: item.bluetoothName,
                                deviceId: item.deviceId,
                                warrantyDays: item.warrantyDays,
                                warrantyExpiration: item.warrantyExpiration
                            }));
                            console.log("处理后的产品数据:", this.products);
                        } 
                        // 检查result.data.data是否是数组（根据网络预览，可能是嵌套的data结构）
                        else if (result && result.data && Array.isArray(result.data.data)) {
                            console.log("响应数据的data.data属性是数组");
                            // 映射API返回的字段到组件需要的字段
                            this.products = result.data.data.map(item => ({
                                id: item.productId,
                                sn: item.serialNumber,
                                code: item.activationCode,
                                time: item.activationTime,
                                bluetoothName: item.bluetoothName,
                                deviceId: item.deviceId,
                                warrantyDays: item.warrantyDays,
                                warrantyExpiration: item.warrantyExpiration
                            }));
                            console.log("处理后的产品数据:", this.products);
                        } else {
                            console.log("响应数据格式不正确，设置产品列表为空");
                            this.products = [];
                        }
                    } else {
                        console.error("获取产品数据失败，状态码:", response.statusCode);
                        this.error = "网络连接异常";
                        this.products = [];
                    }
                },
                fail: (err) => {
                    console.error("获取产品数据失败，错误:", err);
                    this.error = "网络连接异常";
                    this.products = [];
                },
                complete: () => {
                    this.loading = false;
                    console.log("请求完成，loading设置为false");
                }
            });
        },
        unbind(index) {
            const item = this.products[index];
            uni.showModal({
                title: "确认去激活",
                content: `确定去激活序列号为 ${item.sn} 的产品吗？`,
                success: (res) => {
                    if (res.confirm) {
                        // 调用去激活API
                        uni.request({
                            url: "https://www.bistec.cn/api/deactivate",
                            method: "POST",
                            header: {
                                "content-type": "application/json"
                            },
                            data: {
                                productId: item.id
                            },
                            success: (response) => {
                                if (response.statusCode === 200) {
                                    // 调用sendData方法，初始化所有参数为0，modeIndex为1
                                    const mockThat = {
                                        drawProgress: 0,
                                        gaugeList: [{ progress: 0 }, { progress: 0 }, { progress: 0 }],
                                        sceneListIndex: 0,
                                        activateFlag: 0, // 激活标志位设为0（去激活）
                                    };
                                    // 等待sendData完成后再断开蓝牙连接
                                    try {
                                        sendData(1, mockThat);
                                        console.log("发送去激活数据成功");
                                    } catch (error) {
                                        console.error("发送去激活数据失败", error);
                                    }
                                    uni.showToast({
                                        title: "已去激活",
                                        icon: "none",
                                    });
                                    // 返回激活画面
                                    setTimeout(() => {
                                        // 断开蓝牙连接
                                        bluetoothManager.disconnect();
                                        // 重置蓝牙状态
                                        bluetoothManager.reset();
                                        // 从列表中移除
                                        this.products.splice(index, 1);
                                        uni.reLaunch({
                                            url: "/pages/ble/index",
                                        });
                                    }, 1000);
                                } else {
                                    console.error("去激活API调用失败", response);
                                    uni.showToast({
                                        title: "去激活失败",
                                        icon: "error",
                                        duration: 2000,
                                    });
                                }
                            },
                            fail: (err) => {
                                console.error("去激活失败", err);
                                uni.showToast({
                                    title: "去激活失败",
                                    icon: "error",
                                    duration: 2000,
                                });
                            }
                        });
                    }
                },
            });
        },
    },
    created() {
        uni.getSystemInfo({
            success: (res) => {
                this.system = res;
                const menu = uni.getMenuButtonBoundingClientRect();
                this.menu = menu;
                this.statusBarHeight = res.statusBarHeight;
                this.menuHeight = menu.height;
                this.menuTop = menu.top;
                this.navigatorHeight =
                    (menu.top - res.statusBarHeight) * 2 + menu.height;
                this.totalHeight = this.statusBarHeight + this.navigatorHeight;
                this.backTop = this.statusBarHeight + this.navigatorHeight / 2 - 13;
                this.titleTop = this.statusBarHeight + (this.navigatorHeight - 24) / 2;
                // 获取当前连接的蓝牙设备信息
                this.connectedDeviceName = bluetoothManager.getConnectedDeviceName();
                this.connectedDeviceId = bluetoothManager.deviceId;

                // 获取产品数据
                this.getProducts();
            },
        });
    },
};
</script>

<style lang="scss" scoped>
.container {
    box-sizing: border-box;
    width: 100%;
    min-height: 100vh;
    background: #020314;
    position: relative;

    .all-back {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        z-index: 0;
    }
}

.profile {
    box-sizing: border-box;
    padding: 0 28rpx 40rpx;
    min-height: 100vh;
    background: transparent;

    .header {
        width: 100%;
        color: #fff;
        text-align: center;
        font-size: 32rpx;
        position: relative;

        .back-icon {
            position: absolute;
            left: 20rpx;
        }
    }

    .title {
        color: #50caff;
        font-size: 30rpx;
        font-weight: 600;
        text-align: center;
        margin: 10rpx 0 20rpx;
    }

    .list {
        .item {
            background: rgba(255, 255, 255, 0.06);
            backdrop-filter: blur(2px);
            border: 1rpx solid rgba(255, 255, 255, 0.12);
            border-radius: 16rpx;
            padding: 24rpx;
            margin-bottom: 24rpx;

            .info {
                .row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8rpx 0;

                    .label {
                        color: #9fb3c8;
                        font-size: 26rpx;
                    }

                    .value {
                        color: #e6f0ff;
                        font-size: 26rpx;
                    }
                }

                .divider {
                    height: 1rpx;
                    background: rgba(255, 255, 255, 0.1);
                    margin: 8rpx 0;
                }
            }

            .actions {
                display: flex;
                justify-content: flex-end;
                margin-top: 16rpx;
                /* 避免边缘像素合并，留出 物理像素 的右侧余量 */
                padding-right: 4rpx;

                .unbind {
                    color: #ff6b6b;
                    /* 1rpx 在部分机型会被像素合并，导致右侧不显。调整为 2rpx 并开启边框参与布局 */
                    box-sizing: border-box;
                    border: 2rpx solid #ff6b6b;
                    background: transparent;
                    font-size: 24rpx;
                    padding: 10rpx 24rpx;
                    line-height: 1;
                    border-radius: 8rpx;
                    /* 备用方案：若仍有机型出现缺边，可开启内阴影模拟描边 */
                    /* box-shadow: 0 0 0 1px #ff6b6b inset; */
                }
            }
        }

        .empty {
            text-align: center;
            color: #9fb3c8;
            margin-top: 60rpx;
            font-size: 26rpx;
        }

        .empty.error {
            color: #ff6b6b;
        }
    }
}
</style>
