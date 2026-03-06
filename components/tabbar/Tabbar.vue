<template>
  <view class="tabbar">
    <view
      class="tabbar-item"
      v-for="(item, index) in list"
      :key="index"
      @click="tabbarChange(item, index)"
    >
      <image
        class="item-img"
        :class="{ 'none-text-img': item.text == '' }"
        :src="item.icon_a"
        v-if="current == index"
      ></image>
      <image
        class="item-img"
        :class="{ 'none-text-img': item.text == '' }"
        :src="item.icon"
        v-else
      ></image>
      <view
        class="item-name"
        :class="{ tabbarActive: current == index }"
        v-if="item.text"
      >
        {{ item.text }}
      </view>
    </view>
  </view>
</template>

<script>
import store from "../../store";
import { sendData } from "../../util/sendInfo";
export default {
  props: {
    current: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      gaugeList: [
        {
          name: "前悬架",
          progress: 5,
        },
        {
          name: "侧倾",
          progress: 5,
        },
        {
          name: "后悬架",
          progress: 5,
        },
      ],
      // 拉压
      drawProgress: 5,
      // 快速调节
      sceneListIndex: 3,

      list: [
        {
          text: "运动",
          icon: "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/iconSport.png", //未选中图片
          icon_a:
            "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/iconSport_active.png", //选中图片
          path: "/pages/index/index", //页面路径
        },
        {
          text: "舒适",
          icon: "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/iconComfort.png",
          icon_a:
            "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/iconComfort_active.png",
          path: "",
        },
        {
          text: "自动",
          icon: "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/iconAuto.png",
          icon_a:
            "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/iconAuto_active.png",
          path: "",
        },
        {
          text: "",
          icon: "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/iconSettings.png",
          icon_a:
            "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/iconSettings_active.png",
          path: "/page_setting/setting/Setting",
        },
		{
		  text: "",
		  icon: "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/person.png",
		  icon_a:
		    "https://bistec.cn/photo/pics/smallApp/wxb90a7178ae2b176e/iconImage/person_active.png",
		  path: "/page_setting/profile/Profile",
		},
      ],
    };
  },
  methods: {
    //这里就是点击跳转的页面
    tabbarChange(item, index) {
      //if(this.$store.state.settingStatus && item.text){

      if (index == 3 || index == 4) {
		console.log("item.path",item)
        uni.navigateTo({
          url: item.path,
        });
      } else {
        sendData(index, this);
        store.commit("changeSettingStatus", index);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.tabbar {
  box-sizing: border-box;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 190rpx;
  padding-top: 50rpx;
  background: url("@/static/backImage/tabBack.png") no-repeat;
  background-size: 750rpx 190rpx;
  color: white;
  font-size: 20rpx;

  .tabbar-item {
    display: block;
    //display: flex;
    // flex-direction: column;
    // align-items: center;
    // justify-content: flex-start;
    height: 100%;
    width: 100%;

    .item-img {
      margin: 0 auto;
      display: block;
      width: 60rpx;
      height: 80rpx;
    }
    .none-text-img {
      margin: 0 auto;
      padding-top: 10rpx;
      width: 85rpx;
      height: 87rpx;
    }

    .item-name {
      text-align: center;
      // font-size: 26rpx;
    }
    .tabbarActive {
      color: #0562ff !important;
    }
  }
}
</style>
