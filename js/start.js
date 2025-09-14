    var GameSelf;
    //var FishSelf;
    document.addEventListener('deviceready', function () {
        console.log("Device is ready, initializing AdMob...");
        initAdMob();
        cc.game.onStart();
    }, false);
    
    function initAdMob() {
        if (typeof admob === 'undefined') {
            console.error("AdMob plugin is not loaded!");
            return;
        }
    
        admob.start().then(() => {
            console.log("AdMob is ready!");
            // Cấu hình AdMob nếu cần
            return admob.configure({
                testDeviceIds: ["ca-app-pub-5164399168736625~2409765867"]
            });
        }).then(() => {
            console.log("AdMob configured successfully in start.js!");
        }).catch(error => {
            console.error("Failed to initialize AdMob:", error);
        });
    }
    
    cc.game.onStart = function () {
        
        var resource_list = [
            "images/bg.jpg", 
            "images/gridbg.jpg", 
            "images/grid.png", 
            "images/gridcell.png", 
            "images/2000.png", 
            "images/b0.jpg", 
            "images/b1.jpg", 
            "images/b2.jpg", 
            "images/b3.jpg", 
            "images/b4.jpg", 
            "images/b5.jpg", 
            "images/b6.jpg", 
            "images/b7.jpg", 
            "images/b8.jpg", 
            "images/b9.jpg", 
            "images/menu0.png", 
            "images/menu1.png", 
            "images/menu2.png", 
            "images/menu3.png", 
            "images/home.png", 
            "images/tip.png", 
            "images/help.png", 
            "images/levelbg.png", 
            "images/levellock.png", 
            "font/UTM_Facebook.ttf", 
            "images/heart.png", 
            "audio/click.mp3",
            "audio/win.mp3",
            "audio/snap.mp3",
            "images/play_btn.png",
            "images/next.png",
            "images/reward_bg.png",
            "images/btn_watch_ad.png",
            "images/rewardclose.png",
            "images/bg_welcome.png",
            "images/btn_sound.png",
            "images/gameover_bg.png"   
        ];
        

        cc.LoaderScene.preload(resource_list, function () {
            // alert(1);
            // var canvasNode = document.getElementById(cc.game.config["id"]);
            // canvasNode.style.backgroundColor = "#9a6839";
            for (var i = 0; i < resource_list.length; i++) {
                // cc.textureCache.addImage(resource_list[i].toLowerCase());
            }
            cc.view.adjustViewPort(true);
            cc.view.enableRetina(true); // Thêm ở đây hỗ trợ màn hình retina
            cc.view.setDesignResolutionSize(1440 , 3200, cc.ResolutionPolicy.SHOW_ALL);
            cc.view.resizeWithBrowserSize(true);
            var canvasNode = document.getElementById(cc.game.config["id"]);
            canvasNode.style.backgroundColor = "#02374C";
            
            // cc.director.runScene(new MainHome());
        cc.director.runScene(new WelcomSence());
        }, this);

    };
    function GotoMainSence() {
        // GameInfo.currentLives = GameInfo.maxLives; // Reset số mạng
        console.log("Starting a new game...");
        console.log(`Lives Reset to: ${GameInfo.currentLives}`);
        console.log(`Starting at Level 0, Round 0.`);

        GameSelf = new MainHome();
        cc.director.runScene(cc.TransitionFade.create(0.3, GameSelf));
        
    }
    function GotoStartSence() {

        //GameSelf = new MainHome();
        var mm = new StartGame();
        cc.director.runScene(cc.TransitionFade.create(0.3, mm));

    }

    cc.game.run();

