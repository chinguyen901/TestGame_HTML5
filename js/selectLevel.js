var GameInfo = {
    Level: 0, // Level hiện tại
    Round: 0, // Vòng chơi hiện tại
    LevelTxt: ["Easy", "Medium", "Hard"], // Tên các level
    LevelCell: [4, 5, 6, 7], // Kích thước lưới
    maxLives: 5, // Số mạng tối đa
    currentLives: parseInt(getLocalStorage('currentLives')) || 5, // Số mạng hiện tại, lấy từ Local Storage nếu có

    // Hàm cộng mạng
    addLife: function () {
        if (this.currentLives < this.maxLives) {
            this.currentLives++;
            console.log(`Life added. Current Lives: ${this.currentLives}`);
            GlobalLayer.livesLabel.setString("" + this.currentLives); // Cập nhật nhãn
            setLocalStorage('currentLives', this.currentLives); // Lưu trữ vào Local Storage

        } else {
            console.log("Max lives reached. Cannot add more.");
        }
    },
    // Hàm trừ mạng
    subtractLife: function () {
        if (this.currentLives > 0) {
            this.currentLives--;
            console.log(`Life subtracted. Current Lives: ${this.currentLives}`);
            GlobalLayer.livesLabel.setString("" + this.currentLives); // Cập nhật nhãn
            setLocalStorage('currentLives', this.currentLives); // Lưu trữ vào Local Storage

        } else {
            console.log("No lives left to subtract.");
            this.currentLives = 0; // Đảm bảo currentLives không nhỏ hơn 0
        }
    },
        // Hàm kiểm tra mạng hiện tại
        checkCurrentLives: function () {
        return this.currentLives > 0;
    }
};

var SelectLevelLayer = cc.Layer.extend({
   
    onEnter: function () {
        this._super();
        this.size = cc.director.getWinSize();
        var sp;
        var img = "images/levelbg.png";
        var texture = cc.textureCache.textureForKey(img);
        var img2 = "images/levellock.png";
        var texture2 = cc.textureCache.textureForKey(img2);
        var startX = 0.12 * this.size.width; //tọa độ lưới level
        var startY = 0.65 * this.size.height; //tọa độ lưới level
        var tf;
        var strData = getLocalStorage("lvl" + GameInfo.Level.toString());
        if (strData == null || strData.length == 0)
            strData = "1000000000000000000000000";
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
                sp = new cc.Sprite.create();
                sp.setAnchorPoint(0.5, 0.5); // Đặt anchor tại trung tâm
                if (strData.substr((i * 5) + j, 1) == "0") {

                    sp.initWithTexture(texture2);
                    sp.x = j * 0.18 * this.size.width + startX;
                    sp.y = startY - i * 0.08125 * this.size.height;
                    this.addChild(sp);

                } else {
                    sp.initWithTexture(texture);
                    sp.x = j * 0.18 * this.size.width + startX;
                    sp.y = startY - i * 0.08125 * this.size.height;
                    this.addChild(sp);
                    tf = cc.LabelTTF.create(((i * 5) + j + 1).toString(), "UTM_Facebook", 100);
                    tf.setAnchorPoint(0.5, 0.7); // Đặt anchor tại trung tâm
                    tf.x = sp.x;
                    tf.y = sp.y;
                    this.addChild(tf);
                }
            }

        }
    }
    , 
    CheckClickLevel: function (pos) {
        var startX = 0.12 * this.size.width; //tọa độ lưới level
        var startY = 0.65 * this.size.height; //tọa độ lưới level
        var strData = getLocalStorage("lvl" + GameInfo.Level);
        if (strData == null || strData.length == 0)
            strData = "1000000000000000000000000";
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {

                if (Math.abs(pos.x - (j * 0.18 * this.size.width + startX)) < 50 && Math.abs(pos.y - (startY - i * 0.08125 * this.size.height)) < 50) {
                    if (strData.substr((i * 5) + j, 1) == "0") {
                        console.log("Màn chơi bị khóa"); // trạng thái khi click vào màn chơi bị khóa
                        return -1;
                    } else {
                        var level = GameInfo.Level; // Lấy Level hiện tại
                        var round = (i * 5) + j + 1; // Lấy Round dựa trên vị trí
                        console.log("Level: " + level + ", Round: " + round);    
                        return (i * 5) + j;

                    }
                } 
            }
        }
        return -1;
    }
});

/* NguyeThanhDanhStart thay đổi Cookie thành localStorage*/
// Thay thế hàm getCookie bằng localStorage
function getLocalStorage(key) {
    try {
        return cc.sys.localStorage.getItem(key) || "";
    } catch (e) {
        console.warn("Lỗi khi đọc dữ liệu từ localStorage: " + e);
        return "";
    }
}

// Thay thế hàm addCookie bằng localStorage
function setLocalStorage(key, value) {
    try {
        cc.sys.localStorage.setItem(key, value);
    } catch (e) {
        console.warn("Lỗi khi ghi dữ liệu vào localStorage: " + e);
    }
}
//Phiên bản cập nhật hàm PassLevel
function PassLevel(lvlid, rid) {
    // Lấy chuỗi tiến trình từ localStorage
    var strData = getLocalStorage("lvl" + lvlid);
    if (!strData || strData.length === 0) {
        // Khởi tạo chuỗi mặc định nếu không tồn tại
        strData = "1000000000000000000000000";
    }

    // Cập nhật trạng thái vòng chơi hiện tại (thay "0" thành "1")
    var strData1 = strData.substr(0, rid);
    var strData2 = rid < 24 ? strData.substr(rid + 1) : "";
    var updatedData = strData1 + "1" + strData2;

    // Mở khóa vòng chơi tiếp theo nếu có (rid + 1)
    if (rid < 24 && updatedData.charAt(rid + 1) === "0") {
        updatedData = updatedData.substr(0, rid + 1) + "1" + updatedData.substr(rid + 2);
    }

    // Lưu chuỗi mới vào localStorage
    setLocalStorage("lvl" + lvlid, updatedData);
}
