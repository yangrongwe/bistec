<template>
	<view class="container">
		<image v-for="(item,index) in urls" :key="index" :src="item" mode="" style="width: 0px;height: 0px;opacity: 0;"></image>

		<image class="all-back" src="http://bistec.cn/photo/pics/smallApp/backImage/settingBack.png" mode=""></image>
		
		<view class="header" :style="{height:totalHeight+'px'}">
			<uni-icons :style="{top:menuTop-10+'px'}" class="back-icon" type="back" size="26" color="white" @click="backToIndex"></uni-icons>
			<view :style="{paddingTop:menuTop-10+'px'}">ADC电控主动减振</view>
		</view>
		
		<!-- 情景选择 -->
		<view class="scene-box">
			<view 
				class="model-box" 
				v-for="(item,index) in sceneList" 
				:key="index" 
				@click="statusChange(index)"
			>
				<view class="img-box">
					<image :src="item.activePath" alt="" v-if="item.status">
					<image :src="item.path" alt="" v-else>
				</view>
				<view class="name-box" :class="{'acitve-name':item.status}">{{item.name}}</view>
			</view>
		</view>
		
		<!-- 悬架、侧倾设置 -->
		<view class="car-box">
			<!-- 背景 -->
			<!-- <image class="car-back" src="http://bistec.cn/photo/pics/smallApp/backImage/carBack.png" mode=""></image> -->
			<!-- 悬架、侧倾 -->
			<view v-for="(item,index) in gaugeList" :key="index" class="suspension" :class="{'behind-suspension':item.mainRotate}">
				<!-- 左按钮 -->
				<image class="btn" :src="item.btnLeftImgSrc" mode=""  @click="gaugeAction('reduce',index)"></image>
				<!-- 刻度图 -->
				<view class="suspension-box">
					<image class="gauge-img" :class="{'behind':item.gaugeImgRotate}" :src="item.gaugeImgSrc" mode=""></image>
					<view 
						:class="{
							'suspension-name':item.progressType=='front',
							'heel-name':item.progressType=='heel',
							'behind-suspension-name':item.progressType=='behind'
						}"
					>{{item.name}}</view>
					<!-- 进度 -->
					<image class="progress-img" :src="item.progressImgSrc+item.progress+'.png'" mode=""></image>
				</view>
				<!-- 右按钮 -->
				<image class="btn" :src="item.btnImgSrc" mode="" @click="gaugeAction('add',index)"></image>
			</view>
			<!-- 重置 -->
			<view class="action-btn-box action-reset" @click="reset">
				<view class="action-btn">
					<image class="icon-img" src="http://bistec.cn/photo/pics/smallApp/iconImage/Reset.png" mode=""></image>
					<view class="action-content">点击重置</view>
				</view>
			</view>
			<!-- 应用 -->
			<view class="action-btn-box action-apply" @click="apply">
				<view class="action-btn">
					<image class="icon-img" src="http://bistec.cn/photo/pics/smallApp/iconImage/click.png" mode=""></image>
					<view class="action-content">点击应用</view>
				</view>
			</view>
		</view>

		<!-- 拉伸压缩 -->
		<view class="draw-compress-box">
			<view class="draw-compress-text">拉伸/压缩</view>
			<view class="draw-compress-content">
				<view class="draw-compress-btn" @click="drawAction('reduce')">
					Com
				</view>
				<!-- <image class="btn-image" src="http://bistec.cn/photo/pics/smallApp/iconImage/reduce.png" mode="" @click="drawAction('reduce')"></image> -->
				<view class="progress-box">
					<image class="empty-progress" src="http://bistec.cn/photo/pics/smallApp/drawCompress/progressEmpty.png" mode=""></image>
					<image class="progress" :src="'http://bistec.cn/photo/pics/smallApp/drawCompress/progress_'+drawProgress+'.png'" mode=""></image>
				</view>
				<view class="draw-compress-btn" @click="drawAction('add')">
					Reb
				</view>
				<!-- <image class="btn-image" src="http://bistec.cn/photo/pics/smallApp/iconImage/add.png" mode="" @click="drawAction('add')"></image> -->
			</view>
		</view>
	</view>
</template>

<script>
import store from '../../store'
import {sendData} from "../../util/sendInfo.js"
	export default {
		data() {
			return {
				sceneListIndex:3,
				sceneList:[
					{
						name:"公路",
						path:"http://bistec.cn/photo/pics/smallApp/iconImage/highway.png",
						activePath:"http://bistec.cn/photo/pics/smallApp/iconImage/highway_active.png",
						status:false
					},
					{
						name:"湿地",
						path:"http://bistec.cn/photo/pics/smallApp/iconImage/wetland.png",
						activePath:"http://bistec.cn/photo/pics/smallApp/iconImage/wetland_active.png",
						status:false
					},
					{
						name:"沙漠",
						path:"http://bistec.cn/photo/pics/smallApp/iconImage/desert.png",
						activePath:"http://bistec.cn/photo/pics/smallApp/iconImage/desert_active.png",
						status:false
					}
				],
				gaugeList:[
					{
						name:"前悬架",
						mainRotate:false,
						btnImgSrc:"http://bistec.cn/photo/pics/smallApp/suspension/blueBtnRight.png",
						btnLeftImgSrc:"http://bistec.cn/photo/pics/smallApp/suspension/blueBtnLeft.png",
						gaugeImgRotate:false,
						gaugeImgSrc:"http://bistec.cn/photo/pics/smallApp/suspension/suspension.png",
						progressImgSrc:"http://bistec.cn/photo/pics/smallApp/suspension/progress_behind_",
						progressType:"front",
						progress:5
					},
					{
						name:"侧倾",
						mainRotate:false,
						btnImgSrc:"http://bistec.cn/photo/pics/smallApp/iconImage/add.png",
						btnLeftImgSrc:"http://bistec.cn/photo/pics/smallApp/iconImage/reduce.png",
						gaugeImgRotate:false,
						gaugeImgSrc:"http://bistec.cn/photo/pics/smallApp/heel/heel.png",
						progressImgSrc:"http://bistec.cn/photo/pics/smallApp/heel/progress_",
						progressType:"heel",
						progress:5
					},
					{
						name:"后悬架",
						mainRotate:true,
						btnImgSrc:"http://bistec.cn/photo/pics/smallApp/suspension/blueBtnRight.png",
						btnLeftImgSrc:"http://bistec.cn/photo/pics/smallApp/suspension/blueBtnLeft.png",
						gaugeImgRotate:true,
						gaugeImgSrc:"http://bistec.cn/photo/pics/smallApp/suspension/suspension.png",
						progressImgSrc:"http://bistec.cn/photo/pics/smallApp/suspension/progress_",
						progressType:"behind",
						progress:5
					}
				],
				drawProgress:5,
				system:[],
				menu:[],
				statusBarHeight: 0, //状态栏的高度 
				navigatorHeight: 0, //导航栏高度
				menuHeight: 0, //胶囊高度
				menuTop: 0, //胶囊与顶部的距离
				totalHeight: 0, //总高度
				blueDeviceList:[],
				deviceId:"",
				uuidServices:"",
				characteristicId:"",
				urls:[ //预加载图片地址
					"http://bistec.cn/photo/pics/smallApp/iconImage/highway_active.png",
					"http://bistec.cn/photo/pics/smallApp/iconImage/wetland_active.png",
					"http://bistec.cn/photo/pics/smallApp/iconImage/desert_active.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_behind_1.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_behind_2.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_behind_3.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_behind_4.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_behind_5.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_behind_6.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_behind_7.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_behind_8.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_behind_9.png",
					"http://bistec.cn/photo/pics/smallApp/heel/progress_1.png",
					"http://bistec.cn/photo/pics/smallApp/heel/progress_2.png",
					"http://bistec.cn/photo/pics/smallApp/heel/progress_3.png",
					"http://bistec.cn/photo/pics/smallApp/heel/progress_4.png",
					"http://bistec.cn/photo/pics/smallApp/heel/progress_5.png",
					"http://bistec.cn/photo/pics/smallApp/heel/progress_6.png",
					"http://bistec.cn/photo/pics/smallApp/heel/progress_7.png",
					"http://bistec.cn/photo/pics/smallApp/heel/progress_8.png",
					"http://bistec.cn/photo/pics/smallApp/heel/progress_9.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_1.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_2.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_3.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_4.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_5.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_6.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_7.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_8.png",
					"http://bistec.cn/photo/pics/smallApp/suspension/progress_9.png",
					"http://bistec.cn/photo/pics/smallApp/drawCompress/progress_1.png",
					"http://bistec.cn/photo/pics/smallApp/drawCompress/progress_2.png",
					"http://bistec.cn/photo/pics/smallApp/drawCompress/progress_3.png",
					"http://bistec.cn/photo/pics/smallApp/drawCompress/progress_4.png",
					"http://bistec.cn/photo/pics/smallApp/drawCompress/progress_5.png",
					"http://bistec.cn/photo/pics/smallApp/drawCompress/progress_6.png",
					"http://bistec.cn/photo/pics/smallApp/drawCompress/progress_7.png",
					"http://bistec.cn/photo/pics/smallApp/drawCompress/progress_8.png",
					"http://bistec.cn/photo/pics/smallApp/drawCompress/progress_9.png",
				]
			}
		},
		onShow() {
			//获取系统信息
			uni.getSystemInfo({
				success: res => {
					this.system = res
				}
			})
			
			//获取胶囊信息
			this.menu = uni.getMenuButtonBoundingClientRect()
			
			//计算组件高度
			this.statusBarHeight = this.system.statusBarHeight //状态栏高度
			this.menuHeight = this.menu.height //胶囊高度
			this.menuTop = this.menu.top //胶囊与顶部的距离
			//导航栏高度= （胶囊顶部距离-状态栏高度） x 2 + 胶囊的高度
			this.navigatorHeight = (this.menu.top - this.system.statusBarHeight) * 2 + this.menu.height 
			//总高度 = 状态栏的高度 + 导航栏高度    
			this.totalHeight = this.statusBarHeight + this.navigatorHeight ;
			
			this.init();
			this.checkSceneList();
		},
		methods: {
			//模式变更
			statusChange(index){
				this.sceneListIndex=index;
				this.sceneList.forEach(value=>{
					value.status=false;
				})
				this.sceneList[index].status = true;
				this.sceneList.reverse().reverse();
				switch(index) {
					case 0 :this.gaugeList.forEach((Element)=>{
							Element.progress=5;
						})
						this.drawProgress=5;
						break;
					case 1 :this.gaugeList.forEach((Element)=>{
							Element.progress=2;
						})
						this.drawProgress=2;
						break;
					case 2:this.gaugeList.forEach((Element)=>{
							Element.progress=9;
						})
						this.drawProgress=9;
						break;
				}
			},
			//悬架、侧倾加减
			gaugeAction(type,index){
				const num = this.gaugeList[index].progress;
				if(type=="add"){
					num<9?this.gaugeList[index].progress += 1:null;
					
				}else if(type=="reduce"){
					num>1?this.gaugeList[index].progress -= 1:null;
					
				}
				this.gaugeList.reverse().reverse();
				this.checkSceneList();
			},
			// 重置
			reset(){
				this.gaugeList.forEach(element=>{
					element.progress=5;
				})
				this.drawProgress=5;
				this.checkSceneList();
			},
			// 应用
			apply(){	
				sendData(3,this);
				store.commit("changeSettingStatus",3);
				uni.navigateBack({
					url:"/pages/index/index",
					
				})
			},
			//拉压加减
			drawAction(type){
				const number = this.drawProgress;
				if(type=="reduce"){
					if(number>1){
						this.drawProgress -= 1;
					}
				}else if(type=="add"){
					if(number<9){
						this.drawProgress +=1;
					}
				}
				this.checkSceneList();
			},
			// 监测是否需要将icon切换为able状态
			checkSceneList(){
				if(this.gaugeList.every((Element=>Element.progress==5)) && this.drawProgress==5){
					this.sceneList.forEach(value=>{
						value.status=false;
					})
					this.sceneList[0].status=true;
					this.sceneList.reverse().reverse();
				}else if(this.gaugeList.every((Element=>Element.progress==2)) && this.drawProgress==2){
					this.sceneList.forEach(value=>{
						value.status=false;
					})
					this.sceneList[1].status=true;
					this.sceneList.reverse().reverse();
				}else if(this.gaugeList.every((Element=>Element.progress==9)) && this.drawProgress==9){
					this.sceneList.forEach(value=>{
						value.status=false;
					})
					this.sceneList[2].status=true;
					this.sceneList.reverse().reverse();
				}else{
					this.sceneList.forEach(value=>{
						value.status=false;
					})
					this.sceneList.reverse().reverse();
				}
			},
			//返回首页
			backToIndex(){
				if(this.$store.state.modalStatus){
					this.$store.commit("changeModalStatus",false);
				}
			  // let deviceId =uni.getStorageSync("deviceId");
			  
				// uni.closeBLEConnection({
				//   deviceId,
				//   success(res) {
				// 	  this.$store.state.blueStatus = true;
				//     console.log("断开了")
				//   }
				// })
				uni.navigateBack({
					url:"/pages/index/index",
					
				})
			},
			//获取初始状态
			init() {
				const that = this;
				this.deviceId = uni.getStorageSync("deviceId");
				this.uuidServices = uni.getStorageSync("uuidServices");
				this.characteristicId = uni.getStorageSync("writeCharacteristicId");
				if(uni.getStorageSync("setting")){
					const setting = JSON.parse(uni.getStorageSync("setting"));
					this.gaugeList[0].progress = setting.frontSuspension;
					this.gaugeList[1].progress = setting.heel;
					this.gaugeList[2].progress = setting.behindSuspension;
					this.drawProgress = setting.DC;
					// this.sceneList.forEach(value => {
					// 	if(value.name==setting.fastChange){
					// 		value.status=true;
					// 	}else{
					// 		value.status=false;
					// 	}
					// })
				}
			},
			//二进制字符串补位
			addInt2(str){
				for(let i=str.length;i<4;i++){
					str = "0"+str;
				}
				return str;
			}
		}
	}
	function HexStringToBuffer(hexString) {
	        let rawStr = hexString.trim().toUpperCase();
	        let len = rawStr.length;
	        let curCharCode = 0;
	        let utf8Arr = [];
	        let i = 0;
	        while (i < len) {
	            let h = 0;
	            while ((i < len) && ((h < 48 || h > 57) && (h < 65 || h > 70))) {
	                h = rawStr.charCodeAt(i);
	                i++;
	            }
	
	            if (i >= len) {
	                break;
	            }
	
	            let l = 0;
	            while ((i < len) && ((l < 48 || l > 57) && (l < 65 || l > 70))) {
	                l = rawStr.charCodeAt(i);
	                i++;
	            }
	
	            if (l >= 48 && l <= 57) {
	                l = l - 48;
	            }
	            else if (l >= 65 && l <= 70) {
	                l = l - 65 + 10;
	            }
	            else {
	                break;
	            }
	
	            if (h >= 48 && h <= 57) {
	                h = h - 48;
	            }
	            else if (h >= 65 && h <= 70) {
	                h = h - 65 + 10;
	            }
	            else {
	                break;
	            }
	
	            curCharCode = l + (h << 4);
	            utf8Arr.push(curCharCode);
	        }
	        return new Uint8Array(utf8Arr).buffer;
	    }
	</script>

<style lang="less" scoped>
.container {
	box-sizing: border-box;
	position: relative;
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
		height: 100%;
		z-index: 0;
	}
	.header{
		position: relative;
		width: 100%;
		color: white;
		text-align: center;
		font-size: 32rpx;
		.back-icon{
			position: absolute;
			left: 8rpx;
		}
	}
	.scene-box{
		box-sizing: border-box;
		position: relative;
		padding: 53rpx 20rpx 0;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		width: 100%;
		z-index: 1;
		.model-box{
			.img-box{
				width: 73rpx;
				height: 83rpx;
				image{
					width:100%;
					height:100%;
				}
			}
			.name-box{
				width: 100%;
				font-size: 20rpx;
				text-align: center;
				color: #A6BCDC;
			}
			.acitve-name{
				color: #0562FF;
			}
		}
	}
	.car-box{
		box-sizing: border-box;
		position: relative;
		margin-top: 5vh;
		padding: 0 40rpx;
		width: 100%;
		height: 848rpx;
		.car-back{
			position:absolute;
			left:50%;
			transform: translateX(-50%);
			display: block;
			width: 343rpx;
			height: 775rpx;
		}
		
		.suspension{
			width: 100%;
			height: 195rpx;
			display: flex;
			flex-direction: row;
			justify-content: space-around;
			align-items: center;
			.btn{
				position: relative;
				width: 60rpx;
				height: 60rpx;
				z-index: 5;
			}
			.suspension-box{
				position: relative;
				width: 383rpx;
				height: 100%;
				.gauge-img{
					position: absolute;
					left: 0;
					width: 100%;
					height:100%;
				}
				.progress-img{
					position: absolute;
					left: 15rpx;
					width: 353rpx;
					height: 100%;
				}
				.behind{
					transform: rotateX(180deg);
				}
				.suspension-name,.heel-name,.behind-suspension-name{
					position: absolute;
					left: 50%;
					transform: translateX(-50%);
					font-size: 24rpx;
					font-weight: bold;
				}
				.suspension-name{
					width: 80%;
					text-align: center;
					bottom: 15%;
					color: #1DB4FF;
				}
				.heel-name{
					width: 80%;
					text-align: center;
					bottom: 15%;
					color: #F4000C;
				}
				.behind-suspension-name{
					width: 80%;
					text-align: center;
					top: 15%;
					color: #1DB4FF;
				}
			}
		}
		.behind-suspension{
			margin-top: 263rpx;
		}
		
		.action-btn-box{
			position: absolute;
			bottom:28%;
			padding: 8rpx;
			width: 61rpx;
			height: 188rpx;
			border-radius: 61rpx;
			background: linear-gradient(to bottom,#00C0FA,#053CE6);
			.action-btn{
				width: 100%;
				height: 100%;
				background-color: #081628;
				border-radius: 61rpx;
				.icon-img{
					margin:0 auto;
					padding-top: 18rpx;
					display: block;
					width: 27rpx;
					height:27rpx;
				}
				.action-content{
					margin:14rpx auto 0;
					width: 28rpx;
					font-size: 22rpx;
					line-height: 28rpx;
					text-align: center;
					color: #00C0FA;
				}
			}
		}
		.action-reset{
			left: 7%;
		}
		.action-apply{
			right:7%;
		}
	}
	.draw-compress-box{
		position: relative;
		margin-top: 5vh;
		width: 100%;
		z-index: 1;
		.draw-compress-text{
			font-size: 24rpx;
			line-height: 28rpx;
			color:#E80D16;
			text-align: center;
		}
		.draw-compress-content{
			margin-top: 20rpx;
			padding: 0 40rpx;
			display: flex;
			flex-direction: row;
			justify-content: space-around;
			align-items: center;
			// .btn-image{
			// 	position: relative;
			// 	width: 53rpx;
			// 	height: 53rpx;
			// 	z-index: 1;
			// }
			.draw-compress-btn{
				font-size: 24rpx;
				line-height: 28rpx;
				color:#E80D16;
			}
			.progress-box{
				position: relative;
				width: 431rpx;
				height: 27rpx;
				.empty-progress{
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
				}
				.progress{
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
				}
			}
		}
	}
}
</style>
