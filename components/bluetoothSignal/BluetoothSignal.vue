<template>
	<view class="bluetooth-signal-box">
		<template v-if="right">
			<image class="signal-back" :src="signalBackRight" alt="">
			<image class="progress-back-second left" :src="progressBackRight" mode=""></image>
			<image class="progress-back-first right" :src="progressBackRight" mode=""></image>
			<image v-if="first!=0" class="progress-second left" :src="progressFirstRight+first+'.png'" mode=""></image>
			<image v-if="second!=0" class="progress-first right" :src="progressSecondRight+second+'.png'" mode=""></image>
		</template>
		<template v-else>
			<image class="signal-back" :src="signalBack" alt="">
			<image class="progress-back-first left" :src="progressBack" mode=""></image>
			<image class="progress-back-second right" :src="progressBack" mode=""></image>
			<image v-if="first!=0" class="progress-first left" :src="progressFirst+first+'.png'" mode=""></image>
			<image v-if="second!=0" class="progress-second right" :src="progressSecond+second+'.png'" mode=""></image>
		</template>
	</view>
</template>

<script>
	export default {
		name:"BluetoothSignal",
		data() {
			return {
				signalBack:"http://bistec.cn/photo/pics/smallApp/bluetoothSignal/leftSignalBack.png",
				signalBackRight:"http://bistec.cn/photo/pics/smallApp/bluetoothSignal/rightSignalBack.png",
				progressBack:"http://bistec.cn/photo/pics/smallApp/bluetoothSignal/progressLeft.png",
				progressBackRight:"http://bistec.cn/photo/pics/smallApp/bluetoothSignal/progressRight.png",
				progressFirst:"http://bistec.cn/photo/pics/smallApp/bluetoothSignal/left_first_red_",
				progressFirstRight:"http://bistec.cn/photo/pics/smallApp/bluetoothSignal/right_first_yellow_",
				progressSecond:"http://bistec.cn/photo/pics/smallApp/bluetoothSignal/left_second_yellow_",
				progressSecondRight:"http://bistec.cn/photo/pics/smallApp/bluetoothSignal/right_second_red_",
			};
		},
		props:["right","first","second"]
	}
</script>

<style lang="less" scoped>
.bluetooth-signal-box{
	position: relative;
	width: 95rpx;
	height: 225rpx;
	.signal-back{
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height:100%;
	}
	.left{
		left: 10rpx;
	}
	.right{
		right: 10rpx;
	}
	.progress-back-first,.progress-back-second,.progress-first,.progress-second{
		position: absolute;
		width: 34rpx;
		height: 197rpx;
	}
	.progress-back-first,.progress-first{
		top: 19rpx;
	}
	.progress-back-second,.progress-second{
		top: 11rpx;
	}
	.progress-back-first,.progress-back-second{
		z-index: 1;
	}
	.progress-first,.progress-second{
		z-index: 2;
	}
}
</style>