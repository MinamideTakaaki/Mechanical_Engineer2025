let beta, gamma; //x,y軸の傾き値.
let angle=[], reference=[]; //戻り値用の配列.
let running=false; //作動状態かどうかの判定.
let move_forward, move_right, vehicle_direction=0, last_vehicle_direction=0; //前後、左右の移動方向と送信する値,最終送信値.
let screen_direction; //画面の向き(横画面、縦画面).
let direction_table = [[0,7,8,1,2,3,4,5,6],[0,3,4,5,6,7,8,1,2]];
let tolerance=10; //傾きの誤差設定値.
let device = null; //WebBluetoothApiの設定用
let characteristic;

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
      ori="横向き(上部が左)";
      screen_direction=0;
    }else if(type=="landscape-secondary"){
      ori="横向き(上部が右)";
      screen_direction=1;
    }
    console.log(ori, screen_direction);
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
			// arduinoにvehicle_directionを送信.
    	characteristic.writeValue(new TextEncoder().encode(vehicle_direction));
    	console.log("送信: " + vehicle_direction);
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


// WebBluetoothApiで接続
document.getElementById('connect_button').addEventListener("click", async () => {
  try {
    console.log("デバイス検索中...");
    device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "HM" }],
      optionalServices: ["0000ffe0-0000-1000-8000-00805f9b34fb"]
 	  });

    console.log("接続中: " + device.name);
    const server = await device.gatt.connect();

    const service = await server.getPrimaryService("0000ffe0-0000-1000-8000-00805f9b34fb");
    characteristic = await service.getCharacteristic("0000ffe1-0000-1000-8000-00805f9b34fb");

    console.log("接続完了");
    console.log(characteristic);

    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', (event) => {
      const value = new TextDecoder().decode(event.target.value);
      console.log("受信: " + value);
    });

    const sendText = "Hello from Web";
    await characteristic.writeValue(new TextEncoder().encode(sendText));
    console.log("送信: " + sendText);

  } catch (err) {
    console.log("エラー: " + err);
  }
  return characteristic;
});

// 切断
document.getElementById('disconnect_button').addEventListener("click", async () => {
 	if (device && device.gatt.connected) {
    device.gatt.disconnect();
    console.log("切断しました");
  } else {
    console.log("既に切断されています");
  }
});
