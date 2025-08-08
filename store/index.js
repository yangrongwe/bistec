import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);


const store = new Vuex.Store({
    state: {
		isOk:false,
		settingStatus:0,
		modalStatus:true,
		blueStatus:false,
		isShow:false,
    },
    mutations: {
		changeShowTrue(state) {
		    state.isShow = true
		},
		changeShowFalse(state) {
		    state.isShow = false
		},
        changeOk(state) {
            state.isOk = true
        },
		changeFailed(state) {
		    state.isOk = false
		},
		changeBlueStatus(val){
			state.blueStatus = val
		},
        changeSettingStatus(state,num) {
            state.settingStatus = num
        },
        changeModalStatus(state,modalStatus) {
            state.modalStatus = modalStatus
        }
	}
})
export default store