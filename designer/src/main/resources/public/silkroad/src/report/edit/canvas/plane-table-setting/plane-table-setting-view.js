/**
 * @file: 报表新建（编辑）-- 图形组件编辑模块
 * 图形topn设置、图形颜色设置（暂时还未重构完，因此只有图形所特有的设置功能）
 * @author: lizhantong
 * @depend:
 * @date: 2015-03-25
 */

define(
    [
        'dialog',
        'report/edit/canvas/plane-table-setting/plane-table-setting-model',
        'report/edit/canvas/table-setting/text-align/text-align-view',
        'report/edit/canvas/plane-table-setting/field-filter-setting-template'
    ],
    function (
        dialog,
        TableSettingModel,
        textAlignView,
        fieldFilterSettingTemplate
    ) {
        //------------------------------------------
        // 视图类的声明
        //------------------------------------------

        /**
         * 维度设置视图类
         *
         * @class
         */
        var View = Backbone.View.extend({
            events: {
                'click .j-line-s .item': 'setFilter'
            },
            //------------------------------------------
            // 公共方法区域
            //------------------------------------------

            /**
             * 报表组件的编辑模块 初始化函数
             *
             * @param {$HTMLElement} option.el
             * @param {string} option.reportId 报表的id
             * @param {Object} option.canvasView 画布的view
             * @constructor
             */
            initialize: function (option) {
                this.model = new TableSettingModel({
                    canvasModel: option.canvasView.model,
                    reportId: option.reportId
                });
                this.model.set('compId', this.$el.find('.j-comp-setting').attr('data-comp-id'));
                this.canvasView = option.canvasView;
                // 挂载topn设置视图
                this.textAlignView = new textAlignView({
                    el: this.el,
                    reportId: this.model.get('reportId'),
                    canvasView: this.canvasView
                });
            },
            setFilter: function(event) {
                var that = this;
                var $target = $(event.target);
                if (!$target.hasClass('j-item-text')) {
                    return;
                }
                var text = $target.text();
                var id = $target.parent().attr('data-id');
                this.model.getFieldFilterInfo(id, function (data) {
                    data.id = id;
                    data.text = text;
                    var html = fieldFilterSettingTemplate.render(data);
                    dialog.showDialog({
                        title: '设置条件信息',
                        content: html,
                        dialog: {
                            width: 580,
                            height: 200,
                            resizable: false,
                            buttons: [
                                {
                                    text: '提交',
                                    click: function () {
                                        that.saveFieldFilter($(this));
                                    }
                                },
                                {
                                    text: '取消',
                                    click: function () {
                                        $(this).dialog('close');
                                    }
                                }
                            ]
                        }
                    });
                });
            },
            saveFieldFilter: function($dialog) {
                var $filterSet = $('.silkroad-data-field-filter-set');
                var fieldId = $filterSet.find('.field-id').attr('data-id');
                var name = $filterSet.find('.field-name').val();
                var sqlCondition = $filterSet.find('.condition').val();
                var defaultValue = $filterSet.find('.default-value').val();
                var data = {
                    name: name,
                    sqlCondition: sqlCondition,
                    defaultValue: defaultValue
                };

                this.model.saveFieldFilterInfo(fieldId, data, function () {
                    $dialog.dialog('close');
                    window.dataInsight.main.canvas.showReport();
                });
            },
            /**
             * 销毁
             * @public
             */
            destroy: function () {
                this.stopListening();
                // 删除model
                this.model.clear({silent: true});
                delete this.model;
                // 在这里没有把el至为empty，因为在点击图行编辑时，会把图形编辑区域重置，无需在这里
                this.$el.unbind();
            }
        });
        return View;
    });