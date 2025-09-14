var app = {
    initAdMob: function() {
        // Check if the AdMob plugin is loaded
        if (typeof admob === 'undefined') {
            console.error("AdMob plugin is not loaded!");
            return;
        }

        // Initialize AdMob
        admob.start().then(() => {
            console.log("AdMob is ready!");
            // Configure AdMob with test device IDs
            return admob.configure({
                testDeviceIds: ['ca-app-pub-5164399168736625~2409765867']
            });
        }).then(() => {
            console.log("AdMob configured successfully!");
            // Load rewarded ad when AdMob is ready
            this.loadRewardedAd();
        }).catch(error => {
            console.error("Failed to initialize AdMob:", error);
        });
    },

    loadRewardedAd: function() {
        // Define the ad unit ID
        const adUnitId = 'ca-app-pub-3940256099942544/1712485313';
        admob.rewarded.load({
            adUnitId: adUnitId
        }).then(() => {
            console.log('Rewarded Ad is loaded!');
        }).catch(error => {
            console.error('Rewarded Ad failed to load:', error);
        });
    },

    showRewardedAd: function() {
        // Define the ad unit ID
        const adUnitId = "ca-app-pub-3940256099942544/5224354917";
        const rewarded = new admob.RewardedAd({
            adUnitId: adUnitId
        });

        // Event listener for when the ad is dismissed
        rewarded.on("dismiss", () => {
            console.log("Rewarded ad dismissed.");
            lastAdTime = Date.now();
            // Optionally load the ad again here if you want to show it again later
            this.loadRewardedAd();
        });

        // Load the ad and then show it
        return rewarded.load().then(() => {
            console.log("Showing rewarded ad now");
            return rewarded.show();
        }).catch(error => {
            console.error("Failed to load or show rewarded ad:", error);
        });
    }
};

// Add a 'deviceready' event listener to initialize AdMob when the device is ready
document.addEventListener('deviceready', function() {
    app.initAdMob();
}, false);

var GameMenu = cc.Menu.extend({
    itemLevel0: null,
    itemLevel1: null,
    itemLevel2: null,
    itemLevel3: null,
    ctor: function () {
        this._super();
        var newGameNormal = cc.Sprite.create("images/menu0.png"); 
        this.itemLevel0 = new cc.MenuItemSprite(newGameNormal, null, null, function () {
            playClickSound();
            this.onLevelSelect(0, this.itemLevel0);
        }.bind(this));

        newGameNormal = cc.Sprite.create("images/menu1.png"); 
        this.itemLevel1 = new cc.MenuItemSprite(newGameNormal, null, null, function () {
            playClickSound();
            this.onLevelSelect(1, this.itemLevel1);
        }.bind(this));

          newGameNormal = cc.Sprite.create("images/menu2.png"); 
          this.itemLevel2 = new cc.MenuItemSprite(newGameNormal, null, null, function () {
            playClickSound();
            this.onLevelSelect(2, this.itemLevel2);
        }.bind(this));

        // newGameNormal = cc.Sprite.create("images/menu3.png"); 
        // this.itemLevel3 = new cc.MenuItemSprite(newGameNormal, null, null, function () {
        //     playClickSound();
        //     this.onLevelSelect(3, this.itemLevel3);
        // }.bind(this));

        this.initWithItems([this.itemLevel0, this.itemLevel1, this.itemLevel2, this.itemLevel3]);
    },
    onEnter: function ()
    {
        this._super();
        this.alignItemsVerticallyWithPadding(100); // Adjusted padding from 30 to 50
          
    },
    onLevelSelect: function (lv, target) {
        // Create a sequence of actions: scale up and then scale back down
        var scaleUp = cc.ScaleTo.create(0.1, 1.2);
        var scaleDown = cc.ScaleTo.create(0.1, 1.0);
        var sequence = cc.Sequence.create(scaleUp, scaleDown);
        target.runAction(sequence);


        GameInfo.Level = lv;
        GotoMainSence();

    }
});

var StartSenceLayer = cc.Layer.extend({
    menu: null,
    onEnter: function () {
        this._super();
        var size = cc.director.getWinSize();
        
                
        var sp = cc.Sprite.create("images/bg.jpg");
        // sp.x = 240;
        // sp.y = 320;
        sp.x = size.width / 2;
        sp.y = size.height / 2;
        this.addChild(sp, 1);             // Z-order = 1 (cao hơn màu nền)
        
        this.menu = new GameMenu();
        this.menu.setPosition(cc.p(size.width / 2, size.height * 0.36)); // Đặt menu ở giữa chiều ngang và 36% chiều cao
        this.addChild(this.menu, 2);      // Z-order = 2 (cao nhất)
    }
});
 
var StartGame = cc.Scene.extend({
    layer: null,   
    onEnter: function () {
        this._super(); 
        this.addChild(new StartSenceLayer());
       

    }
});

//Màn hình welcome
var WelcomSenceLayer = cc.Layer.extend({
    btnPlay_Wel: null,
    onEnter: function () {
        this._super();
        var size = cc.director.getWinSize();

        // Background image
        var bg = cc.Sprite.create("images/bg_welcome.png");
        bg.x = size.width / 2;
        bg.y = size.height / 2;
        this.addChild(bg);

        // Play button
        this.btnPlay_Wel = cc.Sprite.create("images/play_btn.png");
        this.btnPlay_Wel.x = size.width / 2;
        this.btnPlay_Wel.y = size.height * 0.2;
        this.btnPlay_Wel.setVisible(false); // Ban đầu ẩn nút Play
        this.addChild(this.btnPlay_Wel);

        // Initialize and show the banner ad
        this.showBannerAd();


        // Thêm bộ lắng nghe sự kiện cho nút bấm Play
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                if (cc.rectContainsPoint(rect, locationInNode)) {
                    playClickSound(); // Phát âm thanh click nếu cần
                    target.runAction(cc.Sequence.create(
                        cc.ScaleTo.create(0.1, 1.2),
                        cc.ScaleTo.create(0.1, 1.0)
                    ));
                    GotoStartSence(); // Chuyển sang StartSenceLayer sau khi quảng cáo được hiển thị

                    // Hiển thị quảng cáo thưởng
                    // app.showRewardedAd().then(() => {
                    //     GotoStartSence(); // Chuyển sang StartSenceLayer sau khi quảng cáo được hiển thị
                    // }).catch((error) => {
                    //     console.error("Không thể hiển thị quảng cáo thưởng:", error);
                    //     GotoStartSence(); // Chuyển sang StartSenceLayer ngay cả khi quảng cáo không hiển thị được
                    // });

                    return true;
                }
                return false;
            }
        }, this.btnPlay_Wel);
        },

        showBannerAd: function () {
            var self = this; // Truy cập đến đối tượng WelcomSenceLayer
            if (typeof admob === 'undefined' || !admob.BannerAd) {
                console.error("AdMob plugin is not ready or BannerAd is undefined.");
                self.btnPlay_Wel.setVisible(true); // Hiển thị nút Play ngay cả khi quảng cáo không khả dụng
                return;
            }

            const banner = new admob.BannerAd({
                adUnitId: 'ca-app-pub-3940256099942544/6300978111',
                position: 'bottom'
            });

            banner.load().then(() => {
                console.log("Banner ad loaded successfully!");
                return banner.show();
            }).then(() => {
                console.log("Banner ad shown successfully!");
                self.btnPlay_Wel.setVisible(true); // Chỉ hiển thị nút Play sau khi quảng cáo đã được hiển thị
            }).catch(error => {
                console.error("Failed to load or show banner ad:", error);
                self.btnPlay_Wel.setVisible(true); // Hiển thị nút Play ngay cả khi quảng cáo không tải được
            });
        },
                  
});

var WelcomSence = cc.Scene.extend({
    onEnter: function () {
        this._super();
        this.addChild(new WelcomSenceLayer());
    }
});