let beta, gamma; //x,y軸の傾き値.
let angle=[], reference=[]; //戻り値用の配列.
let running=false; //作動状態かどうかの判定.
let move_forward, move_right, vehicle_direction, last_vehicle_direction=0; //前後、左右の移動方向と送信する値,最終送信値.
let screen_direction; //画面の向き(横画面、縦画面).
let direction_table = [[0,1,2,3,4,5,6,7,8],[0,5,6,7,8,1,2,3,4]];
let tolerance=10; //傾きの誤差設定値.

// 画面の傾きを取得する.
function handleOrientation(event) {
	angle[0]=event.beta; //x軸回転.
	angle[1]=event.gamma; //y軸回転.
	return angle;
}


function getOrientation(){
    let type=screen.orientation.type;
    let ori="";
    if(type=="landscape-primary"){
      ori="横向き(上部が右)";
      screen_direction=0;
    }else if(type=="landscape-secondary"){
      ori="横向き(上部が左)";
      screen_direction=1;
    }
    console.log(ori, screen_direction);
  }


// スマホの傾きをローバーの進行方向に変換する.
function angle_to_direction() {
	// getScreen_direction();
	if(running) {
		let delta_beta = angle[0] - reference[0];
		let delta_gamma = angle[1] - reference[1];
		if(Math.abs(delta_beta) < tolerance) {　
			move_forward=0; //前後移動無し.
		} else if(delta_beta <= tolerance*-1) {
			move_forward=1; //前移動.
		} else if(delta_beta >= tolerance) {
			move_forward=-1; //後ろ移動.
		}
		if (Math.abs(delta_gamma) < tolerance) {
			move_right=0; //左右移動無し.
		} else if(delta_gamma <= tolerance*-1) {
			move_right=-1; //左移動.
		} else if(delta_gamma >= tolerance) {
			move_right=1; //右移動.
		}
		if (move_forward==0 && move_right==0) {
			vehicle_direction=direction_table[screen_direction][0]; //静止.
		} else if (move_forward==1 && move_right==0) {
			vehicle_direction=direction_table[screen_direction][1]; //前.
		} else if (move_forward==1 && move_right==1) {
			vehicle_direction=direction_table[screen_direction][2]; //右斜め前.
		} else if (move_forward==-0 && move_right==1) {
			vehicle_direction=direction_table[screen_direction][3]; //右.
		} else if (move_forward==-1 && move_right==1) {
			vehicle_direction=direction_table[screen_direction][4]; //右斜め後ろ.
		}　else if (move_forward==-1 && move_right==0) {
			vehicle_direction=direction_table[screen_direction][5]; //後ろ.
		} else if (move_forward==-1 && move_right==-1) {
			vehicle_direction=direction_table[screen_direction][6]; //左斜め後ろ.
		} else if (move_forward==0 && move_right==-1) {
			vehicle_direction=direction_table[screen_direction][7]; //左.
		} else if (move_forward==1 && move_right==-1) {
			vehicle_direction=direction_table[screen_direction][8]; //左斜め前.
		}
		if (vehicle_direction!= last_vehicle_direction) {
			// arduinoにmove_forwardとmove_rightの配列を送信.
			console.log(vehicle_direction, "送信");
			last_vehicle_direction=vehicle_direction; //最終値の更新.
		}
	}
}

window.addEventListener("deviceorientation", handleOrientation, true); //画面の傾きを取得.

window.addEventListener("load",() => {
    getOrientation();
    screen.orientation.onchange= () => {
    getOrientation();
  };
});



// 開始ボタン.
document.getElementById("start_button").addEventListener("click", () => {
	reference[0] = angle[0]; //x軸傾きの基準.
	reference[1] = angle[1]; //y軸傾きの基準.
	running = true;
	console.log(reference, "reference");
	return reference;
});

setInterval(angle_to_direction, 1000); //1000msごとに

document.getElementById("finish_button").addEventListener("click", () => {
	running=false;
	console.log("finish_button")
});
