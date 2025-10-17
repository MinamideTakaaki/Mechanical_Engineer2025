let beta, gamma; //x,y軸の傾き値.
let angle=[], reference=[]; //戻り値用の配列.
let running=false; //作動状態かどうかの判定.
let move_forward, move_right; //前後、左右の移動方向.
let last_forward=0, last_right=0; //移動方向の最終値.
let tolerance=10; //傾きの誤差設定値

// 画面の傾きを取得する.
function handleOrientation(event) {
 	let event_beta = event.beta; //x軸回転.
	angle[0]=event_beta;
	let event_gamma = event.gamma; //y軸回転.
	angle[1]=event_gamma;
	return angle;
}

// スマホの傾きをローバーの進行方向に変換する.
function angle_to_direction() {
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
		if (move_forward!=last_forward || move_right!=last_right) {
			// arduinoにmove_forwardとmove_rightの配列を送信.
			console.log(move_forward, move_right, "送信");
			last_forward=move_forward;
			last_right=move_right;
		}
	}
}

window.addEventListener("deviceorientation", handleOrientation, true); //画面の傾きを取得する.

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
