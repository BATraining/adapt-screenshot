define([
    'coreJS/adapt',
    'backbone',
    './html2canvas'
], function(Adapt, Backbone, Html2canvas) {

    var ScreenShotView = Backbone.View.extend({

        initialize: function(){
            this.listenTo(Adapt, 'remove', this.remove, this);
            this.listenTo(Adapt, 'pageView:ready', this.onPageViewReady, this);
            this._isBarVisible = false;
        },

        onPageViewReady: function(){
            this.setUpPage();
        },

        btnClick: function(event){
            var self = this;
            var stage = this.model.get("_stage");
            var blocks = this.model.getChildren();
            var blockModel = blocks.models;
            if(stage != undefined){
                var currentBlock = blockModel[stage];
                this.getCanvas(currentBlock);
                setTimeout(function(){
                    self.generateImage(currentBlock);
                },1000)
            }
        },

        setUpPage: function(){
            var data = this.model.toJSON();
            var template = Handlebars.templates["screenshot"];
            $('.navigation').prepend(template(data));
            $('.screenshot-button').on('click',_.bind(this.btnClick,this));
        },

        getCanvas:function(currentBlock){
            var self = this;
            var blockId = currentBlock.get("_id");
            var blockDiv = document.getElementsByClassName(blockId)[0];
            Html2canvas($(blockDiv), {
                onrendered: function(canvas) {
                    self.canvasRef = canvas;
                }
            });
        },

        generateImage:function(currentBlock){
            var blockId = currentBlock.get("_id");
            var a = document.createElement("a");
            var dt = this.canvasRef.toDataURL('image/jpeg');
            a.href = dt;
            a.download = blockId+"-toc.jpeg";
            a.click();
        }
    });

    Adapt.on('articleView:postRender', function(articleView) {
        var articleModel = articleView.model;
        var screenshot = articleModel.get("_screenshot");
        if(screenshot !== undefined && screenshot._isEnabled == true){
            new ScreenShotView({
                model: articleModel
            });
        }
        
    });

    Adapt.on('menuView:postRender', function(view) {
        if (view.model.get('_id') == Adapt.location._currentId) {
            $('.screenshot-inner').remove();
            return;
        }
        var viewType = view.model.get('_type');
        if (viewType == 'course') return;
    })
});
