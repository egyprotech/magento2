/**
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'jquery',
    'ko',
    'underscore',
    'mageUtils',
    'uiComponent'
], function ($, ko, _, utils, Component) {
    'use strict';

    return Component.extend({
        defaults: {
            listens: {
                '${ $.provider }:reloaded': 'hideLoader'
            }
        },

        initialize: function () {
            _.bindAll(this, 'refreshResizeConfig', 'initResizeConfig');
            this._super();
            this.config = {
                entryTable: {
                    state: false,
                    promise: $.Deferred()
                },
                nameSpacing: {
                    cellsDataAttribute: 'data-cl-resize',
                    cellsDataAttrPrefix: 'column-',
                    divsResizableAttribute: 'data-cl-elem',
                    divsResizableAttrName: 'shadow-div'
                },
                showLines: 4,
                dragRange: 10
            };
        },
        /**
         * @see event listener handlers
         * @returns Object with handlers methods
         */
        _handlers: function () {
            var t = this;

            return {
                /**
                 * @see resolve promise when mouse first time entry in the table
                 * @event mouse enter
                 * @returns {Object} with entry property
                 */
                entryInTable: function () {
                    var cfg = t.config;

                    if (!cfg.entryTable.state) {
                        cfg.entryTable.state = true;
                        cfg.entryTable.promise.resolve();
                    }

                    return cfg.entryTable;
                }
            };
        },

        eventListener: function () {
            var t = this;

            $(t.table).bind('mouseenter', t._handlers().entryInTable);
            t.config.entryTable.promise.done(t.initResizeConfig);
        },
        /**
         * @see set property to config
         * @returns Object with add methods
         */
        _set: function () {
            var t = this,
                cfg = this.config;

            return {
                /**
                 * @see set height for rows
                 * @param {Array} rows rows elements, {Number} rows length
                 * @returns {Array} with max height for all rows
                 */
                rowsMaxHeight: function (rowsElements, rowsLength) {
                    var re = rowsElements || cfg.rowsElements || this.rowsElements(),
                        rl = rowsLength || cfg.rowsLength || this.rowsLength(),
                        i = 0,
                        curRow;

                    cfg.rowsMaxHeight = [];

                    for (i; i < rl; i++) {
                        curRow = $(re[i]).find('div');
                        curRow.css('white-space', 'nowrap');
                        cfg.rowsMaxHeight[i] = curRow.height();
                        curRow.css('white-space', 'normal');
                    }

                    return cfg.rowsMaxHeight;
                },
                /**
                 * @see add rows elements to current rows
                 * @params {Array} rows collections, {Number} rows length
                 * @returns {Array} Rows with rows elements inner
                 */
                rowsElements: function (rowsCollection, rowsLength) {
                    var rc = rowsCollection || cfg.rowsCollection || this.rowsCollection(),
                        rl = rowsLength || cfg.rowsLength || this.rowsLength(),
                        curRow,
                        i = 0;

                    cfg.rowsElements = [];

                    for (i; i < rl; i++) {
                        curRow = $(rc[i]);
                        cfg.rowsElements[i] = $.merge(curRow.find('th'), curRow.find('td'));
                    }

                    return cfg.rowsElements;
                },
                /**
                 * @see add cells elements to current column
                 * @param {Array} cells collection, {Number} columns length
                 * @returns {Array} Columns with cells element inner
                 */
                columnsElements: function (cellsCollection, columnsLength) {
                    var i = 0,
                        j = 0,
                        cc = cellsCollection || cfg.cellsCollection || this.cellsInColumn(),
                        cl = columnsLength || cfg.columnsLength || this.columnsLength(),
                        length = cc.length;

                    cfg.columnsElements = [];

                    for (i; i < length; i++) {
                        i !== 0 ? j++ : j = 0;

                        if (j >= cl) {
                            j = 0;
                        }

                        i <= j ? cfg.columnsElements[j] = [] : false;
                        cfg.columnsElements[j].push(cc[i]);
                    }

                    return cfg.columnsElements;
                },
                /**
                 * @see length cells in one column to config
                 * @param {Array} cells collection, {Number} columns length
                 * @returns {Number} length in column
                 */
                cellsInColumn: function (cellsCollection, columnsLength) {
                    var cc = cellsCollection || cfg.cellsCollection || this.cellsCollection(),
                        cl = columnsLength || cfg.columnsLength || this.columnsLength();

                    cfg.cellsInColumn = cc.length / cl;

                    return cfg.cellsInColumn;
                },
                /**
                 * @see set cells collection property to config
                 * @returns {Array} cells collection
                 */
                cellsCollection: function () {
                    var table = $(t.table);

                    cfg.cellsCollection = $.merge(table.find('th'), table.find('td'));

                    return cfg.cellsCollection;
                },
                /**
                 * @see set rows collection property to config
                 * @returns {Array} rows collection
                 */
                rowsCollection: function (rowsCollection) {
                    cfg.rowsCollection = rowsCollection || $(t.table).find('tr');

                    return cfg.rowsCollection;
                },
                /**
                 * @see set columnsLength property to config
                 * @param {Array} cellsCollection - cells collection
                 * @param {Array} rowsCollection - rows collections
                 * @returns columns length property
                 */
                columnsLength: function (cellsCollection, rowsCollection) {
                    var cc = cellsCollection || cfg.cellsCollection || this.cellsCollection(),
                        rc = rowsCollection || cfg.rowsCollection || this.rowsCollection();

                    cfg.columnsLength = cc.length / rc.length;

                    return cfg.columnsLength;
                },
                /**
                 * @see set rowLength property to config
                 * @param {Array} rowsCollection - rows collection
                 * @returns rows length property
                 */
                rowsLength: function (rowsCollection) {
                    cfg.rowsLength = rowsCollection ? rowsCollection.length : cfg.rowsCollection.length;

                    return cfg.rowsLength;
                }
            };
        },
        /**
         * @see check some property
         * @returns Object with add methods
         */
        _is: function () {
            var t = this;

            return {
                /**
                 * @see check rows property in object
                 * @param {Object} obj - object for check
                 * @returns Object with add methods
                 */
                rows: function (obj) {
                    return Boolean(obj.rows);
                }
            };
        },
        /**
         * @see call when initialize cells collection
         * @see add function for manipulate with DOM tree
         * @returns Object with add methods
         */
        _add: function () {
            var t = this,
                cfg = t.config;

            return {
                /**
                 * @see add data attributes for cells collections
                 * @returns this
                 */
                dataAttribute: function (columnsElements, cellsDataAttribute, cellsDataAttrPrefix, cellsInColumn) {
                    var ce = columnsElements || cfg.columnsElements || t._set().columnsElements(),
                        cic = cellsInColumn || cfg.cellsInColumn || t._set().cellsInColumn(),
                        cda = cellsDataAttribute || cfg.nameSpacing.cellsDataAttribute,
                        cdp = cellsDataAttrPrefix || cfg.nameSpacing.cellsDataAttrPrefix,
                        i = 0,
                        j,
                        lengthElements = ce.length;

                    for (i; i < lengthElements; i++) {
                        j = 0;

                        for (j; j < cic; j++) {
                            $(ce[i][j]).attr(cda, cdp + i);
                        }
                    }

                    return cfg;
                },
                /**
                 * @see add divs to cells for resize columns
                 * @returns this
                 */
                divsResizable: function (columnsElements, columnsLength, dragRange) {
                    var ce = columnsElements || cfg.columnsElements || t._set().columnsElements(),
                        cl = columnsLength || cfg.columnsLength || t._set().columnsLength(),
                        drAttr = cfg.nameSpacing.divsResizableAttribute,
                        drAttrName = cfg.nameSpacing.divsResizableAttrName,
                        drRange = dragRange || cfg.dragRange || 10,
                        i = 0,
                        template = '<div ' + drAttr + '="' + drAttrName + '" style="position:absolute; ' +
                            'width:' + drRange + 'px; height:100%; top:0; right:0; margin-right:-' + drRange + 'px;' +
                            'cursor: e-resize;"></div>';

                    for (i; i < cl; i++) {
                        $(columnsElements[i][0])
                            .css({position: 'relative'})
                            .append(template);
                    }
                }
            };
        },

        setTable: function (elem) {
            this.table = elem;
            this.eventListener();
        },

        setColumn: function (elem, viewModel) {
            viewModel.on('visible', this.refreshConfig);

            if (this._is().rows(viewModel)) {

            }
        },

        initResizeConfig: function () {
            var t = this,
                set = t._set(),
                add = t._add();

            set.cellsCollection();  //{Array}   - set to this.config.cellsCollection
            set.rowsCollection();   //{Array}   - set to this.config.rowsCollection
            set.rowsLength();       //{Number}  - set to this.config.rowsLength
            set.columnsLength();    //{Number}  - set to this.config.columnsLength
            set.cellsInColumn();    //{Number}  - set to this.config.cellsInColumn
            set.columnsElements();  //{Array}   - set to this.config.columnsElements
            set.rowsElements();     //{Array}   - set to this.config.rowsElements
            set.rowsMaxHeight();    //{Array}   - set to this.config.rowsMaxHeight
            add.dataAttribute();    //{Object}  - add data attribute to table cells
            add.divsResizable();     //{Object}  - add data attribute to table cells
            //set.columnsResizable();

            return this;
        },

        refreshResizeConfig: function () {
            var cfg = this.config,
                t = this;

            console.log(this);
        }

    });
});
