<template>
  <view v-show="isOk" class="container">
    <image class="all-back" :src="back" mode=""></image>
    <bluetooth-content :launch="modalStatus" :isOk="isOk"></bluetooth-content>
    <view-tabbar :current="current" @changeToSport="changeToSport"></view-tabbar>
  </view>
</template>

<script>
import Tabbar from '@/components/tabbar/Tabbar.vue';
import BluetoothContent from "@/components/bluetoothContent/BluetoothContent.vue";

export default {
  data() {
    return {}
  },
  computed: {
    isOk() {
      return this.$store.state.isOk
    },
    current() {
      console.log(this.$store.state.settingStatus.toString())
      return this.$store.state.settingStatus.toString();
    },
    back() {
      switch(this.$store.state.settingStatus) {
        case 0 : return "http://bistec.cn/photo/pics/smallApp/backImage/sportBack.png";
        case 1 : return "http://bistec.cn/photo/pics/smallApp/backImage/comfortBack.png";
        case 2 : return "http://bistec.cn/photo/pics/smallApp/backImage/autoBack.png";
        case 3 : return "http://bistec.cn/photo/pics/smallApp/backImage/settingBack.png";
        default: return ""
      }
    },
    modalStatus() {
      return this.$store.state.modalStatus;
    }
  },
  components: {
    'view-tabbar': Tabbar,
    'bluetooth-content': BluetoothContent
  },
  methods: {
    // 分享给好友
    onShareAppMessage() {
      return {
        title: 'ADC电控主动减震',
        path: '/pages/index/index',
        imageUrl: ''
      };
    },
    
    // 分享到朋友圈
    onShareTimeline() {
      return {
        title: '电控主动减震',
        path: '/pages/index/index',
        imageUrl: ''
      };
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  box-sizing: border-box;
  width: 100%;
  height: 100vh;
  font-size: 14px;
  line-height: 24px;
  background: #020314;
  .all-back{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 0;
  }
}
</style>