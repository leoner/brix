KISSY.add("brix/core/pagelet", function(S, Chunk) {
    /**
     * 用以给brick打上id的标记,brick有id则返回
     * @method _stamp
     * @param el
     * @return {string}
     * @ignore
     */

    function _stamp(el, prefix) {
        prefix = prefix || 'brick_';
        if (!el.attr('id')) {
            el.attr('id', S.guid('brix_' + prefix));
        }
        return el.attr('id');
    }
    /**
     * Brix Pagelet 是组件的管理器，实现组件的层次化渲染。
     * 一个页面由多个组件和非组件的HTML片段组成，实际创建过程中需要一个个动态创建，
     * 基于约定为大的原则，采用“钩子”和Mustache，自动化的完成组件渲染和行为附加
     * @extends Brix.Chunk
     * @class Brix.Pagelet
     */
    function Pagelet() {
        Pagelet.superclass.constructor.apply(this, arguments);
        var self = this;
        //初始化属性
        self.isReady = false;
        self.readyList = [];
        self.bricks = [];
        self.isAddBehavior = false;
        //如果是自动渲染，或者已经在dom中，则触发rendered事件
        if (self.get('autoRender')||self.get('tmpler').inDom) {
            self.on('rendered',function(){
                //增加参数回调
                var callback = self.get('callback');
                if(callback&&typeof callback === 'function'){
                    self.ready(callback);
                }
                //自动添加行为渲染
                if(self.get('behavior')){
                    self.addBehavior();
                }
            });
            self.render();
        }
    }
    Pagelet.ATTRS = {
        /**
         * 自动添加组件行为
         * @cfg {Boolean}
         */
        behavior:{
            value:true 
        },
        /**
         * 行为添加完成后的回调方法
         * @cfg {Function}
         */
        callback:{
            value:null
        }
    }
    S.extend(Pagelet, Chunk, {
        /**
         * 获取brick的实例
         * @param  {String} id     brick的id
         * @return {Object}        组件实例
         * @private
         */
        getBrick: function(id, bricks) {
            var self = this,
                brick;
            S.each(self.bricks, function(b) {
                if (b.id === id) {
                    brick = b.brick;
                    return false;
                }
            });
            return brick || null;
        },
        /**
         * 给组件添加行为
         */
        addBehavior: function() {
            var self = this;
            if (self.get('rendered')&&!self.isAddBehavior) {
                self.isAddBehavior = true;
                var el = self.get('el');
                //构建pagelet所有的brick组件
                var bricks = self.bricks = [];
                var brickNodes = el.all('[bx-name]');
                if (el.hasAttr('bx-name')) {
                    brickNodes = brickNodes.add(el[0]);
                }
                brickNodes.each(function(brickNode){
                    var id = _stamp(brickNode),
                        name = brickNode.attr('bx-name'),
                        path = brickNode.attr('bx-path'),
                        config = brickNode.attr('bx-config');
                    config = config ? eval("config=" + config) : {};
                    bricks.push({
                        id :id,
                        name:name,
                        path: path,
                        config: config
                    });
                });

                //构建pagelet需要引用组件js
                if(bricks.length>0){
                    var useList = [];
                    S.each(bricks, function(o) {
                        if(!o.path){
                            o.path = 'brix/gallery/'+o.name+'/';
                        }
                        if(!S.inArray(useList,o.path)){
                            useList.push(o.path);
                        }
                    });
                    //实例化pagelet所有组件
                    S.use(useList.join(','),function(S){
                        var useClassList = arguments;
                        S.each(bricks, function(o) {
                            var id = o.id;
                            var config = S.merge({
                                container:'#'+id,
                                id: id,
                                el: '#' + id,
                                pagelet: self
                            }, o.config);
                            var TheBrick = useClassList[S.indexOf(o.path, useList)+1];
                            var myBrick = new TheBrick(config);
                            o.brick = myBrick;
                        });
                        useClassList = null;
                        self._fireReady();
                    });
                }
                else{
                    self._fireReady();
                }
            }
        },
        /**
         * 渲染完成后需要执行的函数
         * @param {Function} fn 执行的函数
         */
        ready: function(fn) {
            if (this.isReady) {
                fn.call(window, this);
            } else {
                this.readyList.push(fn);
            }
        },
        /**
         * 触发ready添加的方法
         * @private
         */
        _fireReady: function() {
            var self = this;
            if (self.isReady) {
                return;
            }
            self.isReady = true;
            if (self.readyList) {
                var fn, i = 0;
                while (fn = self.readyList[i++]) {
                    fn.call(self);
                }
                self.readyList = null;
            }
        },
        /**
         * 销毁组件或者pagelet
         * @param  {String} id 组件id,如果带了id，销毁组件
         */
        destroy: function(id) {
            var self = this,
                el = self.get('el'),
                tmpler = self.get('tmpler');
            if(id){
                for (var i = 0; i < self.bricks.length; i++) {
                    var o = self.bricks[i];
                    if(id===o.id){
                        self._destroyBrick(o);
                        self.bricks.splice(i,1);
                        return false;
                    }
                };
            }
            else{
                S.each(self.bricks, function(o,i) {
                    self._destroyBrick(o);
                    self.bricks = null;
                });
                if(tmpler){
                     tmpler.tmpls = null;
                }
                el.remove();
            }

            el = null;
        },
        /**
         * 销毁brick引用
         * @param  {Object} o 需要销毁的对象
         * @private
         */
        _destroyBrick: function(o) {
            if (o.brick) {
                o.brick.destroy();
                o.brick = null;
            }
        }
    });
    return Pagelet;
}, {
    requires: ['./chunk']
});