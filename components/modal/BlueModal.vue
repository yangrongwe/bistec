<template>
	<view class="modal-box" v-if="show">
		<view class="shade"></view>
		<view class="_modalBox">
			<view class="_modal">
			<!-- 	<view class="title">博思汽车科技（无锡）有限公司</view>
				<view class="content">
					<view>市场部总经理 王臻</view>
					<view>电话：13218020510</view>
				</view>
				<image src="/static/QRCode.png" mode="" :show-menu-by-longpress="true"></image> -->
				<view class="title">搜索到的蓝牙</view>
					<view class="content" style="overflow: auto;height: 300rpx;">
						<view v-for="item in blueList" @click="connect(item)">
							{{item.name}}
						</view>
					</view>
					<!-- <image src="/static/QRCode.png" mode="" :show-menu-by-longpress="true"></image> -->
				<view class="btn" @click.stop="clickBtn">暂不连接</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:"Modal",
		data() {
			return {
			};
		},
		props:["blueList","show"],
		methods:{
			clickBtn(){
				this.$emit("unConnect",false)
			},
			connect(item){
				this.$emit("connect",item)
			}
		}
	}
</script>

<style lang="less" scoped>
.modal-box{
	position: fixed;
	top: 0;
	left:0;
	width: 100vw;
	height: 100vh;
	z-index:100;
	.shade{
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: #000;
		opacity: 0.5;
	}
	._modalBox{
		box-sizing: border-box;
		position: absolute;
		top: 50%;
		left:50%;
		transform: translate(-50%,-60%);
		width: 540rpx;
		height: 540rpx;
		padding: 50rpx 50rpx 0;
		background: url("/static/backImage/modalBack.png") no-repeat;
		background-size: 540rpx 540rpx;
		text-align: center;
		._modal{
			.title{
				font-size: 30rpx;
				line-height: 36rpx;
				color:#50CAFF;
				font-weight: 600;
			}
			.content{
				margin: 20rpx 0 15rpx;
				font-size: 30rpx;
				line-height: 60rpx;
				color: #afd3ff;
			}
			image{
				width: 148rpx;
				height: 148rpx;
			}
			.btn{
				// margin-top:15rpx;
				// border-top: 2rpx solid #7e7e7e;
				// padding: 10rpx 0 33rpx;
				font-size: 30rpx;
				line-height: 60rpx;
				color: white;
			}
		}
	}
}
</style>