var BlockSprite = cc.Sprite.extend({
    clrIndex: null,
    arr: null,
    bbox: null,
    InGrid: false,
    atI: 0,
    atJ:0,
    ctor: function (_clrIndex, _arr) {
        this._super();
        clrIndex = _clrIndex;
        this.arr = _arr;
    },
    onEnter: function () {
        this._super();
        
        
        var img = "images/b" + clrIndex + ".jpg";
        var texture = cc.textureCache.textureForKey(img);
        var sp;
        
        for (var i = 0; i < this.arr.length; i++) {
            for (var j = 0; j < this.arr[i].length; j++) {
                if (this.arr[i][j] == 0) continue;
                sp = new cc.Sprite.create();
                sp.initWithTexture(texture);
                sp.setAnchorPoint(cc.p(0, 0));
                sp.y = -BlockSize * i - BlockSize;
                sp.x = BlockSize * j;                
                sp.setOpacity(220);
                this.addChild(sp);
            }
        }
        this.setAnchorPoint(cc.p(0, 0));

      
    },   
    CheckIsMouseOn:function(p)
    {
        //23,640;
        //p.y = GlobalLayer.size.height - p.y;
        var offy,offx;
        for (var i = 0; i < this.arr.length; i++) {
            for (var j = 0; j < this.arr[i].length; j++) {
                if (this.arr[i][j] == 0) continue;
                offy = BlockSize * i;
                offx = BlockSize * j;
                if (p.x > this.x + offx && p.y > (GlobalLayer.size.height - this.y) + offy && p.x < this.x + offx + BlockSize && p.y < (GlobalLayer.size.height - this.y) + offy + BlockSize) {
                    return true;
                }// else
                   
            }
        }
        return false;
    }
});

var GridSprite = cc.Sprite.extend({
    CellNum:null,
    ctor: function (_CellNum) {
        this._super();
        CellNum = _CellNum;
    },
    onEnter: function () {
        this._super();
        var img = "images/gridcell.png";
        var texture = cc.textureCache.textureForKey(img);
        var sp;
        var sX, sY;
        sX = -BlockSize * CellNum / 2;
        sY = BlockSize * CellNum / 2;
        for (var i = 0; i < CellNum; i++) {
            for (var j = 0; j < CellNum; j++) {
               
                sp = new cc.Sprite.create();
                sp.initWithTexture(texture);
                sp.setAnchorPoint(cc.p(0, 0)); 
                sp.y = -BlockSize * i - BlockSize + sY;
                sp.x = BlockSize * j + sX;
                this.addChild(sp);
            }
        }
        
    }
});

var GameSenceLayer = cc.Layer.extend({
    bg: null,
    grid: null,
    size: null,
    startX:null,
    startY:null,
    arrBlocks: [],
    selectedBlock: null,
    arrStartus: null,
    RoundStatus: 4,
    btnhome: null,
    selLevel: null,
    bg_win: null,
    arrResult: null,
    arrS: null,
    btnTest: null,
    btnHeart: null,
    btnHelp:null,
    btn_sound:null,
    lbTip: null,
    selectedOffset:null,
        // Thuộc tính của phần mạng và đếm ngược thời gian
    timeLabel: null, // Hiển thị thời gian còn lại
    livesLabel: null, // Hiển thị số mạng
    countdown: null, // Biến quản lý countdown
    remainingTime: 0, // Thời gian còn lại cho vòng chơi hiện tại
    
    onEnter: function () {
        this._super();
        
        this.arrStartus = new Array();
        for (var i = 0; i < GameInfo.LevelCell[GameInfo.Level]; i++) {
            this.arrStartus[i] = new Array();
            for (var j = 0; j < GameInfo.LevelCell[GameInfo.Level]; j++) {
                this.arrStartus[i][j] = 0;
            }

        }

        //alert(2);
        this.size = cc.director.getWinSize();
        this.grid = cc.Sprite.create("images/gridbg.jpg");
        this.addChild(this.grid);
        this.grid.x = this.size.width / 2;
        this.grid.y = this.size.height / 2;
        this.grid.setScale(1);

        //this.bg =  cc.Sprite.create("images/grid.png");
        //this.addChild(this.bg);
        //this.bg.setScale(4);

        //this.bg.setAnchorPoint(0,1); 

        this.lbTip = cc.LabelTTF.create(GameInfo.LevelTxt[GameInfo.Level] + " No. " + (GameInfo.Round + 1).toString(), "SimHei", 70);
        this.lbTip.x = this.size.width - this.size.width * 0.70;
        this.lbTip.y = this.size.height - this.size.height * 0.05;
        // this.addChild(this.lbTip);

        gridSize = BlockSize * GameInfo.LevelCell[GameInfo.Level];
       

        this.startX = (this.size.width - gridSize) / 2;
        this.startY = this.size.height - (this.size.height - gridSize) / 2;

        //this.bg.x = startX;
        //this.bg.y = this.size.height - startY;

        this.bg = new GridSprite(GameInfo.LevelCell[GameInfo.Level]);
        this.bg.x = this.size.width / 2; //this.startX;// startX;
        this.bg.y = this.size.height / 2 - 2; //this.startY - 2;
        this.addChild(this.bg);
        this.bg.setScale(0.05);
        this.bg.setVisible(false); // Hide GridSprite initially



        if ('mouse' in cc.sys.capabilities)
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseDown: function (event) {
                    event.getCurrentTarget().SelectBlock(event);
                },
                onMouseMove: function (event) {
                    event.getCurrentTarget().MoveBlock(event);
                },
                onMouseUp: function (event) {
                    event.getCurrentTarget().ReleaseBlock(event);
                }
            }, this);
        else if (cc.sys.capabilities.hasOwnProperty('touches')) {
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ALL_AT_ONCE,
                onTouchesBegan: function (touches, event) {
                    event.getCurrentTarget().SelectBlock(touches[0]);
                },
                onTouchesMoved: function (touches, event) {
                    event.getCurrentTarget().MoveBlock(touches[0]);
                },
                onTouchesEnded: function (touches, event) {
                    event.getCurrentTarget().ReleaseBlock(touches[0]);
                }
            }, this);
        }
        

        this.btnhome = cc.Sprite.create("images/home.png");
        this.btnhome.x = this.size.width - this.size.width * 0.90;
        this.btnhome.y = this.size.height - this.size.height * 0.05;
        this.addChild(this.btnhome);

        this.btnback = cc.Sprite.create("images/home.png");
        this.btnback.setVisible(false); // Ẩn nút btnhome ban đầu
        this.addChild(this.btnback);

        this.btnext = cc.Sprite.create("images/next.png");
        this.btnext.setVisible(false); // Ẩn nút btnhome ban đầu
        this.addChild(this.btnext);

        this.btn_sound = cc.Sprite.create("images/btn_sound.png");
        this.btn_sound.x = this.size.width - this.size.width * 0.10;
        this.btn_sound.y = this.size.height - this.size.height * 0.05;
        this.addChild(this.btn_sound);
        
        // Thêm sự kiện click cho btn_sound
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
        
                // Kiểm tra xem có nhấn vào nút không
                if (cc.rectContainsPoint(rect, locationInNode)) {
                    // Phát âm thanh click
                    playClickSound();
        
                    // Tạo hiệu ứng phóng to và thu nhỏ
                    var scaleUp = cc.ScaleTo.create(0.1, 1.2);
                    var scaleDown = cc.ScaleTo.create(0.1, 1.0);
                    var sequence = cc.Sequence.create(scaleUp, scaleDown);
                    target.runAction(sequence);
        
                    return true; // Xác nhận đã xử lý sự kiện
                }
        
                return false; // Không nhấn vào nút
            },
        
            onTouchEnded: function (touch, event) {
                // Không xử lý gì thêm khi thả nút
            }
        }, this.btn_sound);
        
        // Add event listener for the btnhome button
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
            
                console.log("onTouchBegan: GlobalLayer.RoundStatus =", GlobalLayer.RoundStatus);
        
                if (cc.rectContainsPoint(rect, locationInNode)) {
                    if (GlobalLayer.RoundStatus == 1) { // Chỉ cho phép click khi đang trong vòng chơi
                        console.log("Valid Click: RoundStatus is 1. Proceeding with effect.");
                        playClickSound();
                        var scaleUp = cc.ScaleTo.create(0.1, 1.2);
                        var scaleDown = cc.ScaleTo.create(0.1, 1.0);
                        var sequence = cc.Sequence.create(scaleUp, scaleDown);
                        target.runAction(sequence);
                        return true; // Cho phép xử lý tiếp
                    } else {
                        console.log("Invalid Click: RoundStatus is not 1.");
                        return false; // Ngăn chặn sự kiện tiếp tục xử lý
                    }
                }
                return false; // Không nhấn vào nút
            },
            
            onTouchEnded: function (touch, event) {
                var target = event.getCurrentTarget();
                // Handle the click event (navigate to the start scene)
                GotoStartSence();
            }
        }, this.btnhome);

        this.selLevel = new SelectLevelLayer();
        this.addChild(this.selLevel);

        this.bg_win = cc.Sprite.create("images/tip.png");
        this.bg_win.x = this.size.width / 2; //this.startX;// startX;
        this.bg_win.y = this.size.height - this.size.height * 0.25  ; //this.startY - 2;
        
        this.bg_win.visible = false;

        this.schedule(this.update, 0.5);
       
        // // Nút retry 
        this.btnTest = cc.Sprite.create("images/retry.png");
        this.btnTest.x = this.size.width - this.size.width * 10;//ẩn nơi click
        this.btnTest.y = this.size.height - this.size.height * 10;//ẩn nơi click
        this.addChild(this.btnTest);
        this.btnTest.setVisible(false); // Hide btnTest initially

        // Nút help 
        this.btnHelp = cc.Sprite.create("images/help.png");
        this.btnHelp.x = this.size.width - this.size.width * 10;//ẩn nơi click
        this.btnHelp.y = this.size.height - this.size.height * 10;//ẩn nơi click
        this.addChild(this.btnHelp);
        this.btnHelp.setVisible(false);

        // Nút trái tim
        this.btnHeart = cc.Sprite.create("images/heart.png");
        this.btnHeart.x = this.size.width - this.size.width * 0.50;
        this.btnHeart.y = this.size.height - this.size.height * 0.05;
        this.addChild(this.btnHeart);
        // Số currentLives
        this.livesLabel = cc.LabelTTF.create("" + GameInfo.currentLives, "Arial", 100);
        this.livesLabel.x = this.size.width - this.size.width * 0.50;
        this.livesLabel.y = this.size.height - this.size.height * 0.05;
        this.addChild(this.livesLabel);
        // Đếm ngược
        this.timeLabel = cc.LabelTTF.create("" + this.remainingTime, "Arial", 100);
        this.timeLabel.x = this.size.width - this.size.width * 0.70;
        this.timeLabel.y = this.size.height - this.size.height * 0.05;
        this.addChild(this.timeLabel);
        this.timeLabel.setVisible(false);



    },
    GotoNextRound:function()
    {
        this.RoundStatus = 0;
        GameInfo.Round++;
        if (GameInfo.Round == 25) {
            GotoStartSence();
            return;
        }
        this.GotoToRound(GameInfo.Round);
    },      
    GotoToRound: function (tRound) {
        if (!GameInfo.checkCurrentLives()) {
            // Hiển thị bảng thông báo hết mạng
            var rewardLayer = new RewardSceneLayer();
            this.addChild(rewardLayer, 1000); // High z-order to show on top    
            return; // Không vào màn chơi
        }
    
        this.bg_win.visible = false;
        this.selLevel.visible = false;
        this.RoundStatus = 0;
        GameInfo.Round = tRound;

        var blk;
        for(var i=0;i<this.arrBlocks.length;i++)
        {
            blk = this.arrBlocks[i];
            if (blk) {
                this.removeChild(blk);
                blk = null;
            }
        }
        this.arrBlocks = new Array();

        this.bg.setVisible(true); // Show GridSprite when a round is selected
        this.bg.setScale(0.1);
        this.scheduleOnce(this.RoundStartStep1, 0.1);
        //NguyenThanhDanh thêm
        // Trừ mạng khi bắt đầu vòng chơi
        GameInfo.subtractLife();

        this.remainingTime = RoundTimeInfo[GameInfo.Level][tRound]; // Reset thời gian

        // In thông tin Lives và Level ra console
        console.log(`Starting Round ${tRound} of Level ${GameInfo.Level}`);
        console.log(`Lives Remaining: ${GameInfo.currentLives}`);
    
        this.unschedule(this.updateCountdown);
        this.schedule(this.updateCountdown, 1); // Khởi động lại đếm ngược
    
        // // Show btnTest and btnHelp when a round is selected
        // this.btnTest.setVisible(false);
        // this.btnTest.x = this.size.width - this.size.width * 0.10;
        // this.btnTest.y = this.size.height - this.size.height * 0.05;
        // // Thêm sự kiện click cho nút btnTest
        // cc.eventManager.addListener({
        //     event: cc.EventListener.TOUCH_ONE_BY_ONE,
        //     swallowTouches: true,
        //     onTouchBegan: function (touch, event) {
        //         var target = event.getCurrentTarget();
        //         var locationInNode = target.convertToNodeSpace(touch.getLocation());
        //         var s = target.getContentSize();
        //         var rect = cc.rect(0, 0, s.width, s.height);

        //         console.log("onTouchBegan: GlobalLayer.RoundStatus =", GlobalLayer.RoundStatus);

        //         if (cc.rectContainsPoint(rect, locationInNode)) {
        //             if (GlobalLayer.RoundStatus == 1) { 
        //                 console.log("Valid Click: Restarting round.");
                        
        //                 // Hiệu ứng khi click (phóng to và thu nhỏ)
        //                 playClickSound();
        //                 var scaleUp = cc.ScaleTo.create(0.1, 1.2);
        //                 var scaleDown = cc.ScaleTo.create(0.1, 1.0);
        //                 var sequence = cc.Sequence.create(scaleUp, scaleDown);
        //                 target.runAction(sequence);

        //                 // Restart vòng chơi ngay tại đây
        //                 this.GotoToRound(GameInfo.Round);

        //                 return true; // Sự kiện click hợp lệ
        //             } else {
        //                 console.log("Invalid Click: RoundStatus is not 1.");
        //             }
        //         }
        //         return false; // Không click vào nút hoặc điều kiện không thỏa
        //     }.bind(this),
        // }, this.btnTest);


        this.btnHelp.setVisible(true);
        this.btnHelp.x = this.size.width - this.size.width * 0.30;
        this.btnHelp.y = this.size.height - this.size.height * 0.05;
                // Hiệu ứng nút help
                cc.eventManager.addListener({
                    event: cc.EventListener.TOUCH_ONE_BY_ONE,
                    swallowTouches: true,
                    onTouchBegan: function (touch, event) {
                        var target = event.getCurrentTarget();
                        var locationInNode = target.convertToNodeSpace(touch.getLocation());
                        var s = target.getContentSize();
                        var rect = cc.rect(0, 0, s.width, s.height);
        
                        if (cc.rectContainsPoint(rect, locationInNode)) {
                            // Create a sequence of actions: scale up and then scale back down
                            playClickSound();
                            var scaleUp = cc.ScaleTo.create(0.1, 1.2);
                            var scaleDown = cc.ScaleTo.create(0.1, 1.0);
                            var sequence = cc.Sequence.create(scaleUp, scaleDown);
                            target.runAction(sequence);
                            // Hiển thị lớp trợ giúp
                            GlobalLayer.parent.showHelp1(); 

                            return true;
                        }
                        return false;
                    },
                    onTouchEnded: function (touch, event) {
                        var target = event.getCurrentTarget();
                        // Handle the click event (show help layer)
                        var helpLayer = new HelpScenceLayer(); // Create help layer
                        this.addChild(helpLayer); // Add help layer to the scene
                    }.bind(this)
                }, this.btnHelp);
        

        this.timeLabel.setVisible(true);



        //OneRoundStart

    },
    //NguyenThanhDanh thêm
    updateCountdown: function () {
        if (this.RoundStatus != 1) return; // Chỉ đếm ngược khi đang chơi
    
        this.remainingTime--;
        this.timeLabel.setString("" + this.remainingTime); // Update label
        // console.log(`Time Remaining: ${this.remainingTime} seconds`);
    
        if (this.remainingTime <= 0) {
            this.handleLoss(); // Hết thời gian -> Thua

        }
    },
    handleLoss: function () {
        this.unschedule(this.updateCountdown); // Dừng đếm ngược
    
        // In thông tin thua
        console.log("Time's up! You lost this round.");
        console.log(`Lives Remaining: ${GameInfo.currentLives}`);
        // Hide all blocks
        for (var i = 0; i < this.arrBlocks.length; i++) {
            var blk = this.arrBlocks[i];
            if (blk) {
                blk.setVisible(false);
            }
        }

        
        if (GameInfo.currentLives <= 0) {
            // Hết mạng -> Kết thúc game
            console.log("Hết mạng! Returning to Start Screen...");
            var rewardLayer = new RewardSceneLayer();
            this.addChild(rewardLayer, 1000); // High z-order to show on top
        } else {
            // Còn mạng -> Hiển thị bảng Game Over
            console.log("Retrying the round...");
            var gameOverLayer = new GameOverLayer();
            this.addChild(gameOverLayer, 1000); // High z-order to show on top
        }
    },    
    AfterSelectRound:function()
    {
        this.scheduleOnce(this.RoundStartStep1, 0.3);       
    },
    CreateBlock:function()
    {
        this.lbTip.setString(GameInfo.LevelTxt[GameInfo.Level] + " R. " + (GameInfo.Round+1).toString());
        this.arrBlocks = new Array();
        this.selectedBlock = null;
        var arrR = RoundInfo[GameInfo.Level][GameInfo.Round];
        var arrB;
        var arrNew;
        var arrNew2;
        var sp1;
        var str = "";
        for (var i = 0; i < arrR.length; i++) {
            arrB = arrR[i];
            arrNew = new Array();
            for (var j = 0; j < arrB.length; j++) { 
                str = arrB[j].toString();
                arrNew2 = new Array();
                for (var k = 1; k < str.length; k++) {
                    if (str.substr(k, 1) == 1) {
                        arrNew2[k-1] = 1;
                    } else
                        arrNew2[k-1] = 0;

                }
                arrNew[j] = arrNew2;
            }

            sp1 = new BlockSprite(i, arrNew);
            sp1.x = 50 + Math.random() * 300;
            if (i < arrR.length / 2) {
                sp1.y = 950 + Math.random() * 80;
            } else {
                sp1.y = 3200 - Math.random() * 500;
            }
            this.addChild(sp1);
            this.arrBlocks.push(sp1);
        }
        
    },
    CheckIsInGrid: function (p,extDis) {
        var dis = 8;
        if (extDis)
            dis = extDis;
        if (p.x > this.startX - dis && p.y < this.startY + dis && p.x < this.startX + gridSize + dis && p.y > this.startY - gridSize - dis) {
            return true;
        } else
            return false;
    },
    SelectBlock: function (event) {

        var pos = event.getLocation();
        if (Math.abs(pos.x - this.btnhome.x) < 30 && Math.abs(pos.y - this.btnhome.y) < 30) {
            GotoStartSence();
            this.RoundStatus = 0;
            return;
        }

        if (Math.abs(pos.x - this.btnTest.x) < 30 && Math.abs(pos.y - this.btnTest.y) < 30) {
           
           this.GotoToRound(GameInfo.Round);
            return;
        }

        if (this.RoundStatus == 1 && Math.abs(pos.x - this.btnHelp.x) < 30 && Math.abs(pos.y - this.btnHelp.y) < 30) {

            console.log("Nút Help được nhấn!"); // In ra console kiểm tra
            var helpLayer = new HelpScenceLayer(); // Tạo lớp trợ giúp
            this.addChild(helpLayer); // Thêm lớp trợ giúp vào giao diện
        
            // show_share();
            return;
        }
       
        if (this.RoundStatus ==2) {
            if (Math.abs(pos.x - 650) < 30 && Math.abs(pos.y - (this.size.height / 2 - 45)) < 30) {
                this.GotoNextRound();
                return;
            }
        } else if (this.RoundStatus == 4) {
            var clkLevel = this.selLevel.CheckClickLevel(pos);
            if (clkLevel>-1) {
                this.GotoToRound(clkLevel);
            }
        }
        if (this.RoundStatus != 1) return;
        var blk;
        this.selectedBlock = null;
        
        pos.y = this.size.height - pos.y;
        for (var i =  this.arrBlocks.length-1; i >-1; i--) {
            blk = this.arrBlocks[i];
            if (blk.CheckIsMouseOn(pos)) {
                this.selectedBlock = blk;
                break;
            }
        }
        if (this.selectedBlock) {
            pos.y = this.size.height - pos.y;
            selectedOffset = new cc.p( this.selectedBlock.x-pos.x,this.selectedBlock.y- pos.y  );

        } else
            selectedOffset = new cc.p(0, 0);
    },
    ReleaseBlock: function (event) {
        if (this.RoundStatus != 1 || this.selectedBlock==null) return;
        var offX, offY;
        if (this.CheckIsInGrid(new cc.p(this.selectedBlock.x, this.selectedBlock.y),60)) {
            var offX1 = Math.abs(this.selectedBlock.x - this.startX);
            var offY1 = Math.abs(this.startY - this.selectedBlock.y);
            if (offX1 > 25) offX = BlockSize - offX1;
            else
                offX = offX1;
            if (offY1 > 25) offY = BlockSize - offY1;
            else
                offY = offY1;

            if (offX % BlockSize < 30 && offY % BlockSize < 30) {
                this.selectedBlock.InGrid = true;
                this.selectedBlock.x = this.startX + Math.floor(offX1 / BlockSize) * BlockSize + (offX1 % BlockSize > 25 ? BlockSize : 0);
                this.selectedBlock.y = this.startY - (Math.floor(offY1 / BlockSize) * BlockSize + (offY1 % BlockSize > 25 ? BlockSize : 0));
                playSnapSound();

            }
        }
        this.selectedBlock = null;
    },

    // ReleaseBlock: function (event) {
    //     if (this.RoundStatus != 1 || this.selectedBlock == null) return;
    //     var offX, offY;
    //     var soundPlayed = false; // Flag to check if the sound has been played
    
    //     if (this.CheckIsInGrid(new cc.p(this.selectedBlock.x, this.selectedBlock.y), 60)) {
    //         var offX1 = Math.abs(this.selectedBlock.x - this.startX);
    //         var offY1 = Math.abs(this.startY - this.selectedBlock.y);
    //         if (offX1 > 25) offX = BlockSize - offX1;
    //         else offX = offX1;
    //         if (offY1 > 25) offY = BlockSize - offY1;
    //         else offY = offY1;
    
    //         if (offX % BlockSize < 30 && offY % BlockSize < 30) {
    //             this.selectedBlock.InGrid = true;
    //             this.selectedBlock.x = this.startX + Math.floor(offX1 / BlockSize) * BlockSize + (offX1 % BlockSize > 25 ? BlockSize : 0);
    //             this.selectedBlock.y = this.startY - (Math.floor(offY1 / BlockSize) * BlockSize + (offY1 % BlockSize > 25 ? BlockSize : 0));
                
    //             soundPlayed = true;
    //         }
    //     }
    
    //     if (!soundPlayed) {
    //         playSnapSound(); // Ensure the sound is played
    //     }
    
    //     this.selectedBlock = null;
    // },

    MoveBlock: function (event) {
        //if (this.CheckIsMouseOn(event.getLocation()) == false) {
        //    return ;
        //}
        if (this.RoundStatus != 1) return;
        if (! this.selectedBlock) {
            
            return;
        }
       // var delta = event.getDelta();
    
        this.selectedBlock.InGrid = false;
        var pos = event.getLocation();
        //this.selectedBlock.x += delta.x;
        //this.selectedBlock.y += delta.y;
        this.selectedBlock.x = pos.x + selectedOffset.x;
        this.selectedBlock.y = pos.y + selectedOffset.y;
       // this.selectedBlock.InGrid = false;
       
    }
    ,
    CheckAllStatus: function () {
        var blk;
        var bRet = true;
        for (var i = 0; i < GameInfo.LevelCell[GameInfo.Level]; i++) {
           // this.arrStartus[i] = new Array();
            for (var j = 0; j < GameInfo.LevelCell[GameInfo.Level]; j++) {
                this.arrStartus[i][j] = 0;
            }

        }
        for (var i = this.arrBlocks.length - 1; i > -1; i--) {
            blk = this.arrBlocks[i];
            if (blk.InGrid == true && this.CheckIsInGrid(new cc.p(blk.x, blk.y), 10)) {
                var offX = Math.abs(blk.x - this.startX);
                var offY = Math.abs(this.startY - blk.y);
                if (offX % BlockSize < 3 && offY % BlockSize < 3) {

                    var ix = Math.floor(offX / BlockSize);//+ (offX % BlockSize > 25 ? 1 : 0);
                    var iy = Math.floor(offY / BlockSize);//  + (offY % BlockSize > 25 ? 1 : 0));

                    //if (offX % BlockSize > 1 || offY % BlockSize > 1) {
                    //   // this.selectedBlock.InGrid = true;
                    //    this.selectedBlock.x = this.startX + Math.floor(offX / BlockSize) * BlockSize + (offX % BlockSize > 25 ? BlockSize : 0);
                    //    this.selectedBlock.y = this.startY - (Math.floor(offY / BlockSize) * BlockSize + (offY % BlockSize > 25 ? BlockSize : 0));
                    //}
                    //if (this.arrStartus[ix][y] == 1) {
                    //   bRet = false;

                    for (var k0 = 0; k0 < blk.arr.length; k0++) {
                        for (var k1 = 0; k1 < blk.arr[k0].length; k1++) {
                            if (blk.arr[k0][k1] == 0) continue;
                            try{
                                if (this.arrStartus[iy + k0][ix + k1] == 1) {
                                    return false;
                                }
                                this.arrStartus[iy + k0][ix + k1] = 1;
                            } catch (e) {
                              
                            }
                        }

                    }

                    //   break;

                    // }
                } else
                    return false;
            } else {
                return false;
            }
        }
        for (var i = 0; i < GameInfo.LevelCell[GameInfo.Level]; i++) { 
            for (var j = 0; j < GameInfo.LevelCell[GameInfo.Level]; j++) {
                if (this.arrStartus[i][j] == 0) {
                    return false;
                }
            }

        }
        return bRet;
    },
    OneRoundOK: function () {
        this.unschedule(this.updateCountdown); // Dừng đếm ngược
        this.RoundStatus = 2;
        // Cộng mạng khi thắng
        GameInfo.addLife();

        // In thông tin thắng
        console.log("Congratulations! You completed this round.");
        console.log(`Lives Remaining: ${GameInfo.currentLives}`);
        console.log(`Proceeding to the next round...`);

        playWinSound();

        if (this.bg_win.parent) {
            this.removeChild(this.bg_win);
        }
        // this.bg_win.visible = true;
        // this.addChild(this.bg_win);
        //Đổi thành 1 lớp gameWinLayer
        var gameWinLayer = new GameWinLayer();
        this.addChild(gameWinLayer, 1000); // High z-order to show on top
    
        PassLevel(GameInfo.Level, GameInfo.Round);
        // Nếu đây là màn cuối cùng của Level, mở khóa màn tiếp theo
        if (GameInfo.Round < 24) {
            GameInfo.Round++;
        } else {
            GameInfo.Level++;
            GameInfo.Round = 0;
        }
        // // Hiển thị btnback tại tọa độ trung tâm
        // this.btnback.setVisible(true);
        // this.btnback.x = this.size.width * 0.33;
        // this.btnback.y = this.size.height - this.size.height * 0.33;

        // // Hiển thị btnback tại tọa độ trung tâm
        // this.btnext.setVisible(true);
        // this.btnext.x = this.size.width * 0.66;
        // this.btnext.y = this.size.height - this.size.height * 0.33;
        
        //     // Add event listener for the btnback button
        // cc.eventManager.addListener({
        //     event: cc.EventListener.TOUCH_ONE_BY_ONE,
        //     swallowTouches: true,
        //     onTouchBegan: function (touch, event) {
        //         var target = event.getCurrentTarget();
        //         var locationInNode = target.convertToNodeSpace(touch.getLocation());
        //         var s = target.getContentSize();
        //         var rect = cc.rect(0, 0, s.width, s.height);
            
        //         if (cc.rectContainsPoint(rect, locationInNode)) {
        //             playClickSound();
        //             var scaleUp = cc.ScaleTo.create(0.1, 1.2);
        //             var scaleDown = cc.ScaleTo.create(0.1, 1.0);
        //             var sequence = cc.Sequence.create(scaleUp, scaleDown);
        //             target.runAction(sequence);
        //             return true;
        //         }
        //         return false;
        //     },
            
        //     onTouchEnded: function (touch, event) {
        //         var target = event.getCurrentTarget();
        //         // Handle the click event (navigate to the start scene)
        //         GotoStartSence();
        //     }
        // }, this.btnback);


        //     // Add event listener to btnext button
        //     cc.eventManager.addListener({
        //         event: cc.EventListener.TOUCH_ONE_BY_ONE,
        //         swallowTouches: true,
        //         onTouchBegan: function (touch, event) {
        //             var target = event.getCurrentTarget();
        //             var locationInNode = target.convertToNodeSpace(touch.getLocation());
        //             var s = target.getContentSize();
        //             var rect = cc.rect(0, 0, s.width, s.height);

        //             if (cc.rectContainsPoint(rect, locationInNode)) {
        //                 playClickSound(); // Play click sound if needed
        //                 target.runAction(cc.Sequence.create(
        //                     cc.ScaleTo.create(0.1, 1.2),
        //                     cc.ScaleTo.create(0.1, 1.0)
        //                 ));
        //                 return true;
        //             }
        //             return false;
        //         },
        //         onTouchEnded: function (touch, event) {
                    
        //             GlobalLayer.GotoNextRound(); // Call GotoNextRound
        //             GlobalLayer.btnback.setVisible(false);
        //             GlobalLayer.btnext.setVisible(false);
        //         }
        //     }, this.btnext);
    },
    
    OneRoundStart: function () {

        this.CreateBlock();

        
        this.RoundStatus = 1;
    },
    RoundStartStep1: function () {
        this.bg.runAction(cc.ScaleTo.create(0.3, 1));
        this.scheduleOnce(this.OneRoundStart, 0.6);
    },
    update: function () {
        if (this.RoundStatus != 1) return;
        if (this.CheckAllStatus()) { 
            this.OneRoundOK();
        }
    },
    ShowHelp: function () {
        if (this.RoundStatus != 1) return;
        var sp1;
        var i = 0;
        for (i = 0; i < this.arrBlocks.length; i++) {
            sp1 = this.arrBlocks[i];
            sp1.x = Math.random() * 450 ;             
            sp1.y = Math.random() * 2000 + 500;
            sp1.InGrid = false;
        }
         
        var arr = RoundHelpInfo[GameInfo.Level][GameInfo.Round];
        var iN = Math.floor(Math.random() * arr.length);
        var obj = arr[iN];
        sp1 = this.arrBlocks[obj[0]];
        sp1.x = this.startX + obj[2] * BlockSize;
        sp1.y = this.startY - obj[1] * BlockSize;
        sp1.InGrid = true;
    },
    enableTouchEvents: function(enable) {
        if (enable) {
            cc.eventManager.resumeTarget(this, true);
        } else {
            cc.eventManager.pauseTarget(this, true);
        }
    },

});

var GlobalLayer;
var BlockSize = 200;
var gridSize = 0;

var MainHome = cc.Scene.extend({
    onEnter: function () {
        this._super();

        // Tạo GameSenceLayer
        GlobalLayer = new GameSenceLayer(); 
        this.addChild(GlobalLayer);

        // // Tạo HelpSceneLayer và RewardSceneLayer
        // this.helpLayer = new HelpScenceLayer();
        // this.helpLayer.setVisible(false); // Ban đầu ẩn
        // this.addChild(this.helpLayer, 2000); // z-order cao hơn

        // this.rewardLayer = new RewardSceneLayer();
        // this.rewardLayer.setVisible(false); // Ban đầu ẩn
        // this.addChild(this.rewardLayer, 1000); // z-order thấp hơn
    },

    // Hàm hiển thị lớp trợ giúp
    showHelp1: function () {
        if (this.helpLayer) {
            this.helpLayer.setVisible(true); // Hiển thị lớp trợ giúp
            if (this.rewardLayer) this.rewardLayer.setVisible(false); // Ẩn lớp phần thưởng
        }
    },

    // Hàm hiển thị lớp phần thưởng
    showReward: function () {
        if (this.rewardLayer) {
            this.rewardLayer.setVisible(true); // Hiển thị lớp phần thưởng
            if (this.helpLayer) this.helpLayer.setVisible(false); // Ẩn lớp trợ giúp
        }
    }
});

var HelpScenceLayer = cc.Layer.extend({
    helpContent: null, // Biến lưu hình nội dung trợ giúp
    onEnter: function () {
        this._super();
        console.log("HelpScenceLayer: Đã vào lớp trợ giúp");
        
        // Disable touch events in GameSenceLayer
        //GlobalLayer.enableTouchEvents(false);

        var size = cc.director.getWinSize();
        // Add semi-transparent dark background overlay
        var overlay = cc.LayerColor.create(cc.color(0, 0, 0, 180));
        this.addChild(overlay);


        // Khung nền
        var bg = cc.Sprite.create("images/helpbg.png");
        bg.x = size.width / 2;
        bg.y = size.height - size.height * 0.25
        this.addChild(bg);
        console.log("Khung nền help hiển thị");

        // Chiều cao khung nền
        var bgHeight = size.height * 0.828;

        // Nút "view"
        var btnView = cc.Sprite.create("images/helpview.png");
        btnView.x = size.width * 0.33; // Căn bên trái
        btnView.y = size.height * 0.6; // Vị trí dưới cùng
        btnView.name = "view"; // Đặt tên để dễ nhận diện
        this.addChild(btnView);
        console.log("Nút 'view' hiển thị");

        // Nút "close"
        var btnClose = cc.Sprite.create("images/helpclose.png");
        btnClose.x = size.width * 0.90 ; // Căn bên trái
        btnClose.y = size.height * 0.87; // Vị trí dưới cùng
        btnClose.name = "close"; // Đặt tên để dễ nhận diện
        this.addChild(btnClose);
        console.log("Nút 'close' hiển thị");

        // Nút "buy"
        var btnBuy = cc.Sprite.create("images/helpbuy.png");
        btnBuy.x = size.width * 0.66 ; // Căn bên trái
        btnBuy.y = size.height * 0.6; // Vị trí dưới cùng
        btnBuy.name = "buy"; // Đặt tên để dễ nhận diện
        this.addChild(btnBuy);
        console.log("Nút 'close' hiển thị");


        // Hình nội dung trợ giúp (ban đầu ẩn)
        this.helpContent = cc.Sprite.create("images/help_L1_R1_1.png");
        this.helpContent.x = size.width * 0.5;
        this.helpContent.y = size.height * 0.75;
        this.helpContent.setVisible(false); // Ẩn hình ảnh
        this.addChild(this.helpContent);
        console.log("Hình nội dung trợ giúp được tạo nhưng ẩn");

        // Sự kiện click cho nút "view" và "close"
        var self = this; // Giữ ngữ cảnh lớp hiện tại
        [btnView, btnClose].forEach(function (btn) {
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true, // Ngăn chặn sự kiện lan ra ngoài
                onTouchBegan: function (touch, event) {
                    var target = event.getCurrentTarget();
                    var location = touch.getLocation();

                    // Kiểm tra xem touch có nằm trong nút không
                    var bbox = target.getBoundingBox();
                    if (cc.rectContainsPoint(bbox, location)) {
                        playClickSound();
                        console.log(target.name + " được nhấn!"); // In ra tên nút
                        if (target.name === "view") {
                             
                            self.helpContent.setVisible(true); // Hiển thị hình trợ giúp
                            

                            
                        } else if (target.name === "close") {
                            self.removeFromParent(); // Đóng giao diện trợ giúp
                            //GlobalLayer.enableTouchEvents(true);

                        }
                        return true; // Sự kiện đã xử lý
                    }
                    return false;
                }
            }, btn);
        });
        // Sự kiện click nút buy
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                if (cc.rectContainsPoint(rect, locationInNode)) {
                    playClickSound(); // Play click sound if needed
                    target.runAction(cc.Sequence.create(
                        cc.ScaleTo.create(0.1, 1.2),
                        cc.ScaleTo.create(0.1, 1.0)
                    ));
                    return true;
                }
                return false;
            },
            onTouchEnded: function (touch, event) {
                // Show rewarded ad
                app.showRewardedAd().then(() => {
                    // Call showHelp if ad is successfully viewed
                    if (GlobalLayer && typeof GlobalLayer.ShowHelp === 'function') {
                        GlobalLayer.ShowHelp();
                    } else {
                        console.error("GlobalLayer or ShowHelp function is not defined.");
                    }
                }).catch((error) => {
                    console.error("Failed to show rewarded ad:", error);
                });
            }
        }, btnBuy);
            }
        });
// Create RewardSceneLayer class
var RewardSceneLayer = cc.Layer.extend({
    rewardContent: null,
    onEnter: function () {
        this._super();
        console.log("RewardSceneLayer: Entering reward layer");
        // Disable touch events in GameSenceLayer
        //GlobalLayer.enableTouchEvents(false);

        var size = cc.director.getWinSize();

        // Add semi-transparent dark background overlay
        var overlay = cc.LayerColor.create(cc.color(0, 0, 0, 180));
        this.addChild(overlay);

        // Add reward background
        var bg = cc.Sprite.create("images/reward_bg.png");
        bg.x = size.width / 2;
        bg.y = size.height / 2;
        this.addChild(bg);

        // Add close button
        var btnClose = cc.Sprite.create("images/rewardclose.png");
        btnClose.x = size.width * 0.90; // Position on right side
        btnClose.y = size.height * 0.65; // Position near top
        this.addChild(btnClose);

        // Add watch ad button
        var btnWatchAd = cc.Sprite.create("images/btn_watch_ad.png");
        btnWatchAd.x = size.width / 2;
        btnWatchAd.y = size.height * 0.35;
        this.addChild(btnWatchAd);

        // Add touch event for close button
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                if (cc.rectContainsPoint(rect, locationInNode)) {
                    playClickSound();
                    var scaleUp = cc.ScaleTo.create(0.1, 1.2);
                    var scaleDown = cc.ScaleTo.create(0.1, 1.0);
                    var sequence = cc.Sequence.create(scaleUp, scaleDown);
                    target.runAction(sequence);
                    return true;
                }
                return false;
            },
            onTouchEnded: function (touch, event) {
                GotoStartSence(); // Return to start scene when closed
                // Re-enable touch events in GameSenceLayer
                //GlobalLayer.enableTouchEvents(true);

            }
        }, btnClose);

        // Sự kiện nút btnWatchAd
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                if (cc.rectContainsPoint(rect, locationInNode)) {
                    playClickSound();
                    var scaleUp = cc.ScaleTo.create(0.1, 1.2);
                    var scaleDown = cc.ScaleTo.create(0.1, 1.0);
                    var sequence = cc.Sequence.create(scaleUp, scaleDown);
                    target.runAction(sequence);
                    return true;
                }
                return false;
            },
            onTouchEnded: function (touch, event) {
                // Show rewarded ad
                app.showRewardedAd().then(() => {
                    // Add life and update display if ad is successfully viewed
                    GameInfo.addLife();
                    GlobalLayer.livesLabel.setString("" + GameInfo.currentLives);
                }).catch((error) => {
                    console.error("Failed to show rewarded ad:", error);
                });
            }.bind(this)
        }, btnWatchAd);    }
});
var GameWinLayer = cc.Layer.extend({
    onEnter: function () {
        this._super();
        var size = cc.director.getWinSize();
        // Add semi-transparent dark background overlay
        var overlay = cc.LayerColor.create(cc.color(0, 0, 0, 180));
        this.addChild(overlay);

        // Add background image
        var bg = cc.Sprite.create("images/tip.png");
        bg.x = size.width / 2;
        bg.y = size.height * 0.75;
        this.addChild(bg);

        // Add next button
        var btnNextWin = cc.Sprite.create("images/next.png");
        btnNextWin.x = size.width * 0.66;
        btnNextWin.y = size.height * 0.68;
        this.addChild(btnNextWin);

        // Add home button
        var btnHomeWin = cc.Sprite.create("images/home.png");
        btnHomeWin.x = size.width * 0.33;
        btnHomeWin.y = size.height * 0.68;
        this.addChild(btnHomeWin);

        // Add event listener for the next button
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                if (cc.rectContainsPoint(rect, locationInNode)) {
                    playClickSound();
                    var scaleUp = cc.ScaleTo.create(0.1, 1.2);
                    var scaleDown = cc.ScaleTo.create(0.1, 1.0);
                    var sequence = cc.Sequence.create(scaleUp, scaleDown);
                    target.runAction(sequence);
                    return true;
                }
                return false;
            },
            onTouchEnded: function (touch, event) {
                GlobalLayer.GotoNextRound(); // Call GotoNextRound
                GlobalLayer.btnback.setVisible(false);
                GlobalLayer.btnext.setVisible(false);
                this.getParent().removeChild(this); // Hide GameWinLayer
            }.bind(this)
        }, btnNextWin);

        // Add event listener for the home button
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                if (cc.rectContainsPoint(rect, locationInNode)) {
                    playClickSound();
                    var scaleUp = cc.ScaleTo.create(0.1, 1.2);
                    var scaleDown = cc.ScaleTo.create(0.1, 1.0);
                    var sequence = cc.Sequence.create(scaleUp, scaleDown);
                    target.runAction(sequence);
                    return true;
                }
                return false;
            },
            onTouchEnded: function (touch, event) {
                GotoStartSence(); // Return to start scene
            }
        }, btnHomeWin);
    }
});
var GameOverLayer = cc.Layer.extend({
    onEnter: function () {
        this._super();
        var size = cc.director.getWinSize();
        var overlay = cc.LayerColor.create(cc.color(0, 0, 0, 180));
        this.addChild(overlay);

        // Disable touch events in GameSenceLayer
        //GlobalLayer.enableTouchEvents(false);

        // Add background image
        var bg = cc.Sprite.create("images/gameover_bg.png");
        bg.x = size.width / 2;
        bg.y = size.height * 0.80;
        this.addChild(bg);

        // Add home button
        var btnHome = cc.Sprite.create("images/home.png");
        btnHome.x = size.width * 0.33;
        btnHome.y = size.height * 0.68;
        this.addChild(btnHome);

        // Add retry button
        var btnRetry = cc.Sprite.create("images/retry.png");
        btnRetry.x = size.width * 0.66;
        btnRetry.y = size.height * 0.68;
        this.addChild(btnRetry);


        // Add event listener for the home button
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                if (cc.rectContainsPoint(rect, locationInNode)) {
                    playClickSound();
                    var scaleUp = cc.ScaleTo.create(0.1, 1.2);
                    var scaleDown = cc.ScaleTo.create(0.1, 1.0);
                    var sequence = cc.Sequence.create(scaleUp, scaleDown);
                    target.runAction(sequence);
                    return true;
                }
                return false;
            },
            onTouchEnded: function (touch, event) {
                GotoStartSence(); // Return to start scene when home button is clicked
                // Re-enable touch events in GameSenceLayer
                //GlobalLayer.enableTouchEvents(true);

            }
        }, btnHome);

        // Add event listener for the retry button
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                if (cc.rectContainsPoint(rect, locationInNode)) {
                    playClickSound();
                    var scaleUp = cc.ScaleTo.create(0.1, 1.2);
                    var scaleDown = cc.ScaleTo.create(0.1, 1.0);
                    var sequence = cc.Sequence.create(scaleUp, scaleDown);
                    target.runAction(sequence);
                    return true;
                }
                return false;
            },
            onTouchEnded: function (touch, event) {
                var target = event.getCurrentTarget();
                // Hide the game over notification
                target.getParent().removeFromParent();
        
                GlobalLayer.GotoToRound(GameInfo.Round); // Restart the current round when retry button is clicked
                // Re-enable touch events in GameSenceLayer
                //GlobalLayer.enableTouchEvents(true);

            }
        }, btnRetry);
    }
});
// var gameOverLayer = new GameOverLayer();
// gameOverLayer.setName("GameOverLayer");
// this.addChild(gameOverLayer, 1000); // High z-order to show on top

// var helpLayer = new HelpScenceLayer();
// helpLayer.setName("helpLayer"); // Đặt tên duy nhất
// this.addChild(helpLayer, 2000);
 

// var rewardLayer = new RewardSceneLayer();
// rewardLayer.setName("rewardLayer"); // Đặt tên duy nhất
// this.addChild(rewardLayer, 1000);


// NguyenThanhDanhStart thêm lớp HelpScenceLayer 
 
function playClickSound() {
    try {
        cc.audioEngine.stopAllEffects(); // Dừng tất cả các hiệu ứng âm thanh trước khi phát âm thanh mới
        cc.audioEngine.playEffect("audio/click.mp3", false);
    } catch (e) {
        console.error("Lỗi khi phát âm thanh:", e);
    }
}

function playSnapSound() {
    try {
        // cc.audioEngine.stopAllEffects(); // Dừng tất cả các hiệu ứng âm thanh trước khi phát âm thanh mới
        cc.audioEngine.playEffect("audio/snap.mp3", false);
    } catch (e) {
        console.error("Lỗi khi phát âm thanh:", e);
    }
}

function playWinSound() {
    try {
        // cc.audioEngine.stopAllEffects(); // Dừng tất cả các hiệu ứng âm thanh trước khi phát âm thanh mới
        cc.audioEngine.playEffect("audio/win.mp3", false);
    } catch (e) {
        console.error("Lỗi khi phát âm thanh:", e);
    }
}

