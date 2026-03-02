<template>
  <view v-show="isOk" class="container">
    <image
      class="all-back"
      src="https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/backImage/autoBack.png"
      mode=""
    ></image>
    <bluetooth-content :isOk="isOk"></bluetooth-content>
    <view-tabbar :current="2"></view-tabbar>
  </view>
</template>

<script>
import Tabbar from "@/components/tabbar/Tabbar.vue";
import BluetoothContent from "@/components/bluetoothContent/BluetoothContent.vue";
export default {
  data() {
    return {};
  },
  computed: {
    isOk() {
      return this.$store.state.isOk;
    },
  },
  components: {
    "view-tabbar": Tabbar,
    "bluetooth-content": BluetoothContent,
  },
  onShow() {
    uni.hideTabBar({
      animation: false,
    });
  },
  methods: {},
};
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
    height: 100%;
    z-index: 0;
  }
}
</style>
