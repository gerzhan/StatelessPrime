"use strict";

/*globals angular $ */

angular.module('angular.prime').directive('puiInput', function () {
    return {
        restrict: 'A',
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) {
                return;
            } // do nothing if no ng-model

            var htmlElementName = element[0].nodeName;
            $(function () {
                var checkbox = false;
                var radiobutton = false;
                var password = false;
                var options = scope.$eval(attrs.puiInput) || {};

                if ('INPUT' === htmlElementName) {
                    if (attrs.type === 'password') {
                        options.inline = (options.inline !== undefined) ? options.inline : false;
                        element.puipassword({
                            inline: options.inline
                            , promptLabel: options.promptLabel || 'Please enter a password'
                            , weakLabel: options.weakLabel || 'Weak'
                            , goodLabel: options.goodLabel || 'Medium'
                            , strongLabel: options.strongLabel || 'Strong'
                        });
                        password = true;
                    }
                    if (attrs.type === 'checkbox') {
                        element.puicheckbox();
                        if (attrs.checked) {
                            scope.safeApply(function () {
                                ngModel.$setViewValue(true);
                            });
                        }
                        checkbox = true;
                    }
                    if (attrs.type === 'radio') {
                        element.puiradiobutton();

                        radiobutton = true;
                    }
                    if (!checkbox && !radiobutton && !password) {
                        element.puiinputtext();
                    }

                }
                if ('TEXTAREA' === htmlElementName) {
                    var autoComplete = attrs.puiAutocomplete;
                    var completeSourceMethod = scope.$eval(attrs.puiAutocomplete);

                    options.autoResize = (options.autoResize !== undefined) ? options.autoResize : false;
                    element.puiinputtextarea({
                        autoResize: options.autoResize
                        , autoComplete: autoComplete
                        , scrollHeight: options.scrollHeight || 150
                        , completeSource: completeSourceMethod
                        , minQueryLength: options.minQueryLength || 3
                        , queryDelay: options.queryDelay || 700
                        , counter: $(options.display)
                        , counterTemplate: options.template
                        , maxlength: options.maxLength
                    });

                    if (options.display) {
                        // At this moment, we don't have the scope value yet on the element
                        scope.$watch(ngModel.$viewValue, function (value) {
                            element.puiinputtextarea('updateCounter');
                        });
                    }

                }
                if (checkbox) {
                    // Write data to the model
                    var helper = {
                        read: function () {
                            $(function () {
                                var checked = element.puicheckbox('isChecked');
                                var viewValue = element.val();
                                if (!checked) {
                                    viewValue = null;
                                }
                                scope.safeApply(function () {
                                    ngModel.$setViewValue(viewValue);
                                });
                            });

                        }
                    };

                    // Specify how UI should be updated
                    ngModel.$render = function () {
                        $(function () {
                            if (ngModel.$viewValue) {
                                element.puicheckbox('check', true, true);
                            } else {
                                element.puicheckbox('uncheck', true, true);
                            }

                        });

                    };


                    // Listen for change events to enable binding
                    element.bind('puicheckboxchange', function () {
                        helper.read();
                    });

                }

                if (radiobutton) {
                    // Write data to the model
                    var helper = {
                        read: function () {
                            $(function () {
                                var checked = element.puiradiobutton('isChecked');
                                var viewValue = element.val();
                                if (checked) {
                                    scope.safeApply(function () {
                                        ngModel.$setViewValue(viewValue);
                                    });
                                }
                            });

                        }
                    };

                    // Specify how UI should be updated

                    ngModel.$render = function () {
                        $(function () {
                            if (ngModel.$viewValue == element.val() && !element.puiradiobutton('isChecked')) {
                                element.trigger('click');
                            }
                        });
                    };

                    // Listen for change events to enable binding
                    element.bind('puiradiobuttonchange', function () {
                        helper.read();
                    });

                }

                if (attrs.ngDisabled) {
                    scope.$watch(attrs.ngDisabled, function (value) {

                        if (value === false) {
                            $(function () {
                                if (checkbox) {
                                    element.puicheckbox('enable');
                                } else {
                                    if (radiobutton) {
                                        element.puiradiobutton('enable');
                                    } else {
                                        element.puiinputtext('enable');
                                    }
                                }
                            });
                        } else {
                            $(function () {
                                if (checkbox) {
                                    element.puicheckbox('disable');
                                } else {
                                    if (radiobutton) {
                                        element.puiradiobutton('disable');
                                    } else {
                                        element.puiinputtext('disable');
                                    }
                                }

                            });

                        }
                    });
                }
            });
        }
    };
});;/**
 * PrimeUI checkbox widget
 */
$(function() {

    $.widget("primeui.puicheckbox", {
       
        _create: function() {
            this.element.wrap('<div class="pui-chkbox ui-widget"><div class="ui-helper-hidden-accessible"></div></div>');
            this.container = this.element.parent().parent();
            this.box = $('<div class="pui-chkbox-box ui-widget ui-corner-all ui-state-default">').appendTo(this.container);
            this.icon = $('<span class="pui-chkbox-icon pui-c"></span>').appendTo(this.box);
            this.disabled = this.element.prop('disabled');
            this.label = $('label[for="' + this.element.attr('id') + '"]');
            
            if(this.element.prop('checked')) {
                this.box.addClass('ui-state-active');
                this.icon.addClass('ui-icon ui-icon-check');
            }
            
            if(this.disabled) {
                this.box.addClass('ui-state-disabled');
            } else {
                this._bindEvents();
            }
        },
        
        _bindEvents: function() {
            var $this = this;
            
            this.box.on('mouseover.puicheckbox', function() {
                if(!$this.isChecked())
                    $this.box.addClass('ui-state-hover');
            })
            .on('mouseout.puicheckbox', function() {
                $this.box.removeClass('ui-state-hover');
            })
            .on('click.puicheckbox', function() {
                $this.toggle();
            });
            
            this.element.focus(function() {
                if($this.isChecked()) {
                    $this.box.removeClass('ui-state-active');
                }

                $this.box.addClass('ui-state-focus');
            })
            .blur(function() {
                if($this.isChecked()) {
                    $this.box.addClass('ui-state-active');
                }

                $this.box.removeClass('ui-state-focus');
            })
            .keydown(function(e) {
                var keyCode = $.ui.keyCode;
                if(e.which == keyCode.SPACE) {
                    e.preventDefault();
                }
            })
            .keyup(function(e) {
                var keyCode = $.ui.keyCode;
                if(e.which == keyCode.SPACE) {
                    $this.toggle(true);
                    
                    e.preventDefault();
                }
            });
            
            this.label.on('click.puicheckbox', function(e) {
                $this.toggle();
                e.preventDefault();
            });
        },

        toggle: function(keypress) {
            if(this.isChecked()) {
                this.uncheck(keypress);
            } else {
                this.check(keypress);
            }
            
            this._trigger('change', null, this.isChecked());
        },

        isChecked: function() {
            return this.element.prop('checked');
        },

        check: function(activate, silent) {
            if(!this.isChecked()) {
                this.element.prop('checked', true);
                this.icon.addClass('ui-icon ui-icon-check');

                if(!activate) {
                    this.box.addClass('ui-state-active');
                }
                
                if(!silent) {
                    this.element.trigger('change');
                }
            }
        },

        uncheck: function() {
            if(this.isChecked()) {
                this.element.prop('checked', false);
                this.box.removeClass('ui-state-active');
                this.icon.removeClass('ui-icon ui-icon-check');

                this.element.trigger('change');
            }
        },

        // Added for AngularPrime
        _unbindEvents: function() {
            this.box.off();
            this.element.focus(function() {

            })
            .blur(function() {

            })
            .keydown(function(e) {

            })
            .keyup(function(e) {

            });

            this.label.off();
        },

        disable: function() {
            var input = this.box;

            input.attr('aria-disabled', input.prop('disabled'));
            input.addClass('ui-state-disabled').removeClass('ui-state-hover');
            this._unbindEvents();
        },

        enable: function() {

            this.box.attr('aria-disabled', this.element.prop('disabled'));
            this.box.removeClass('ui-state-disabled');
            this._bindEvents();
        }
    });
    
});;"use strict";
/*globals $ */

/**
 * PrimeUI inputtext widget
 */
$(function() {

    $.widget("primeui.puiinputtext", {

        _create: function() {
            var input = this.element,
            disabled = input.prop('disabled');

            //visuals
            input.addClass('pui-inputtext ui-widget ui-state-default ui-corner-all');
            
            if(disabled) {
                input.addClass('ui-state-disabled');
            }
            else {
                this._enableMouseEffects(input);
            }

            //aria
            input.attr('role', 'textbox').attr('aria-disabled', disabled)
                                          .attr('aria-readonly', input.prop('readonly'))
                                          .attr('aria-multiline', input.is('textarea'));
        },
        
        _destroy: function() {
            
        },

        // Added for AngularPrime
        _enableMouseEffects: function () {
            var input = this.element;
            input.hover(function () {
                input.toggleClass('ui-state-hover');
            }).focus(function () {
                    input.addClass('ui-state-focus');
                }).blur(function () {
                    input.removeClass('ui-state-focus');
                });
        },

        _disableMouseEffects: function () {
            var input = this.element;
            input.hover(function () {

            }).focus(function () {

                }).blur(function () {

                });
        },

        disable: function() {
            var input = this.element;

            input.attr('aria-disabled', input.prop('disabled'));
            input.addClass('ui-state-disabled');
            input.removeClass('ui-state-focus');
            input.removeClass('ui-state-hover');
            this._disableMouseEffects();
        },

        enable: function() {
            this.element.attr('aria-disabled', this.element.prop('disabled'));
            this.element.removeClass('ui-state-disabled');
            this._enableMouseEffects();
        }
        
    });
    
});;/**
 * PrimeUI inputtextarea widget
 */
$(function() {

    $.widget("primeui.puiinputtextarea", {
       
        options: {
             autoResize: false
            ,autoComplete: false
            ,maxlength: null
            ,counter: null
            ,counterTemplate: '{0}'
            ,minQueryLength: 3
            ,queryDelay: 700
        },

        _create: function() {
            var $this = this;
            
            this.element.puiinputtext();
            
            if(this.options.autoResize) {
                this.options.rowsDefault = this.element.attr('rows');
                this.options.colsDefault = this.element.attr('cols');
        
                this.element.addClass('pui-inputtextarea-resizable');
                
                this.element.keyup(function() {
                    $this._resize();
                }).focus(function() {
                    $this._resize();
                }).blur(function() {
                    $this._resize();
                });
            }
            
            if(this.options.maxlength) {
                this.element.keyup(function(e) {
                    var value = $this.element.val(),
                    length = value.length;

                    if(length > $this.options.maxlength) {
                        $this.element.val(value.substr(0, $this.options.maxlength));
                    }

                    if($this.options.counter) {
                        $this.updateCounter();
                    }
                });
            }
            
            if(this.options.counter) {
                this.updateCounter();
            }
            
            if(this.options.autoComplete) {
                this._initAutoComplete();
            }
        },
        
        updateCounter: function() {  // Changed for AngularPrime (visibility)
            var value = this.element.val(),
            length = value.length;

            if(this.options.counter) {
                var remaining = this.options.maxlength - length,
                remainingText = this.options.counterTemplate.replace('{0}', remaining);

                this.options.counter.text(remainingText);
            }
        },
        
        _resize: function() {
            var linesCount = 0,
            lines = this.element.val().split('\n');

            for(var i = lines.length-1; i >= 0 ; --i) {
                linesCount += Math.floor((lines[i].length / this.options.colsDefault) + 1);
            }

            var newRows = (linesCount >= this.options.rowsDefault) ? (linesCount + 1) : this.options.rowsDefault;

            this.element.attr('rows', newRows);
        },
        
        
        _initAutoComplete: function() {
            var panelMarkup = '<div id="' + this.id + '_panel" class="pui-autocomplete-panel ui-widget-content ui-corner-all ui-helper-hidden ui-shadow"></div>',
            $this = this;

            this.panel = $(panelMarkup).appendTo(document.body);

            this.element.keyup(function(e) {
                var keyCode = $.ui.keyCode;

                switch(e.which) {

                    case keyCode.UP:
                    case keyCode.LEFT:
                    case keyCode.DOWN:
                    case keyCode.RIGHT:
                    case keyCode.ENTER:
                    case keyCode.NUMPAD_ENTER:
                    case keyCode.TAB:
                    case keyCode.SPACE:
                    case keyCode.CONTROL:
                    case keyCode.ALT:
                    case keyCode.ESCAPE:
                    case 224:   //mac command
                        //do not search
                    break;

                    default:
                        var query = $this._extractQuery();           
                        if(query && query.length >= $this.options.minQueryLength) {

                             //Cancel the search request if user types within the timeout
                            if($this.timeout) {
                                $this._clearTimeout($this.timeout);
                            }

                            $this.timeout = setTimeout(function() {
                                $this.search(query);
                            }, $this.options.queryDelay);

                        }
                    break;
                }

            }).keydown(function(e) {
                var overlayVisible = $this.panel.is(':visible'),
                keyCode = $.ui.keyCode;

                switch(e.which) {
                    case keyCode.UP:
                    case keyCode.LEFT:
                        if(overlayVisible) {
                            var highlightedItem = $this.items.filter('.ui-state-highlight'),
                            prev = highlightedItem.length == 0 ? $this.items.eq(0) : highlightedItem.prev();

                            if(prev.length == 1) {
                                highlightedItem.removeClass('ui-state-highlight');
                                prev.addClass('ui-state-highlight');

                                if($this.options.scrollHeight) {
                                    PUI.scrollInView($this.panel, prev);
                                }
                            }

                            e.preventDefault();
                        }
                        else {
                            $this._clearTimeout();
                        }
                    break;

                    case keyCode.DOWN:
                    case keyCode.RIGHT:
                        if(overlayVisible) {
                            var highlightedItem = $this.items.filter('.ui-state-highlight'),
                            next = highlightedItem.length == 0 ? _self.items.eq(0) : highlightedItem.next();

                            if(next.length == 1) {
                                highlightedItem.removeClass('ui-state-highlight');
                                next.addClass('ui-state-highlight');

                                if($this.options.scrollHeight) {
                                    PUI.scrollInView($this.panel, next);
                                }
                            }

                            e.preventDefault();
                        }
                        else {
                            $this._clearTimeout();
                        }
                    break;

                    case keyCode.ENTER:
                    case keyCode.NUMPAD_ENTER:
                        if(overlayVisible) {
                            $this.items.filter('.ui-state-highlight').trigger('click');

                            e.preventDefault();
                        }
                        else {
                            $this._clearTimeout();
                        } 
                    break;

                    case keyCode.SPACE:
                    case keyCode.CONTROL:
                    case keyCode.ALT:
                    case keyCode.BACKSPACE:
                    case keyCode.ESCAPE:
                    case 224:   //mac command
                        $this._clearTimeout();

                        if(overlayVisible) {
                            $this._hide();
                        }
                    break;

                    case keyCode.TAB:
                        $this._clearTimeout();

                        if(overlayVisible) {
                            $this.items.filter('.ui-state-highlight').trigger('click');
                            $this._hide();
                        }
                    break;
                }
            });

            //hide panel when outside is clicked
            $(document.body).bind('mousedown.puiinputtextarea', function (e) {
                if($this.panel.is(":hidden")) {
                    return;
                }
                var offset = $this.panel.offset();
                if(e.target === $this.element.get(0)) {
                    return;
                }

                if (e.pageX < offset.left ||
                    e.pageX > offset.left + $this.panel.width() ||
                    e.pageY < offset.top ||
                    e.pageY > offset.top + $this.panel.height()) {
                    $this._hide();
                }
            });

            //Hide overlay on resize
            var resizeNS = 'resize.' + this.id;
            $(window).unbind(resizeNS).bind(resizeNS, function() {
                if($this.panel.is(':visible')) {
                    $this._hide();
                }
            });
        },

        _bindDynamicEvents: function() {
            var $this = this;

            //visuals and click handler for items
            this.items.bind('mouseover', function() {
                var item = $(this);

                if(!item.hasClass('ui-state-highlight')) {
                    $this.items.filter('.ui-state-highlight').removeClass('ui-state-highlight');
                    item.addClass('ui-state-highlight');
                }
            })
            .bind('click', function(event) {
                var item = $(this),
                itemValue = item.attr('data-item-value'),
                insertValue = itemValue.substring($this.query.length);

                $this.element.focus();

                $this.element.insertText(insertValue, $this.element.getSelection().start, true);

                $this._hide();
                
                $this._trigger("itemselect", event, item);
            });
        },

        _clearTimeout: function() {
            if(this.timeout) {
                clearTimeout(this.timeout);
            }

            this.timeout = null;
        },

        _extractQuery: function() {
            var end = this.element.getSelection().end,
            result = /\S+$/.exec(this.element.get(0).value.slice(0, end)),
            lastWord = result ? result[0] : null;

            return lastWord;
        },

        search: function(q) {
            this.query = q;

            var request = {
                query: q 
            };

            if(this.options.completeSource) {
                this.options.completeSource.call(this, request, this._handleResponse);
            }
        },

        _handleResponse: function(data) {
            this.panel.html('');

            var listContainer = $('<ul class="pui-autocomplete-items pui-autocomplete-list ui-widget-content ui-widget ui-corner-all ui-helper-reset"></ul>');

            for(var i = 0; i < data.length; i++) {
                var item = $('<li class="pui-autocomplete-item pui-autocomplete-list-item ui-corner-all"></li>');
                item.attr('data-item-value', data[i].value);
                item.text(data[i].label);

                listContainer.append(item);
            }

            this.panel.append(listContainer).show();
            this.items = this.panel.find('.pui-autocomplete-item');

            this._bindDynamicEvents();

            if(this.items.length > 0) {                            
                //highlight first item
                this.items.eq(0).addClass('ui-state-highlight');

                //adjust height
                if(this.options.scrollHeight && this.panel.height() > this.options.scrollHeight) {
                    this.panel.height(this.options.scrollHeight);
                }

                if(this.panel.is(':hidden')) {
                    this._show();
                } 
                else {
                    this._alignPanel(); //with new items
                }

            }
            else {
                this.panel.hide();
            }
        },

        _alignPanel: function() {
            var pos = this.element.getCaretPosition(),
            offset = this.element.offset();

            this.panel.css({
                            'left': offset.left + pos.left,
                            'top': offset.top + pos.top,
                            'width': this.element.innerWidth()
                    });
        },

        _show: function() {
            this._alignPanel();

            this.panel.show();
        },

        _hide: function() {        
            this.panel.hide();
        },

        // called when created, and later when changing options
        _refresh: function() {
            
        },

        _destroy: function() {

        }
        
    });
    
});;"use strict";
/*globals $ */

/**
 * PrimeUI password widget
 */
$(function () {

    $.widget("primeui.puipassword", {

        options: {
            promptLabel: 'Please enter a password',
            weakLabel: 'Weak',
            goodLabel: 'Medium',
            strongLabel: 'Strong',
            inline: false
        },

        _create: function () {
            this.element.puiinputtext().addClass('pui-password');

            if (!this.element.prop(':disabled')) {
                var panelMarkup = '<div class="pui-password-panel ui-widget ui-state-highlight ui-corner-all ui-helper-hidden">';
                panelMarkup += '<div class="pui-password-meter" style="background-position:0pt 0pt">&nbsp;</div>';
                panelMarkup += '<div class="pui-password-info">' + this.options.promptLabel + '</div>';
                panelMarkup += '</div>';

                this.panel = $(panelMarkup).insertAfter(this.element);
                this.meter = this.panel.children('div.pui-password-meter');
                this.infoText = this.panel.children('div.pui-password-info');

                if (this.options.inline) {
                    this.panel.addClass('pui-password-panel-inline');
                } else {
                    this.panel.addClass('pui-password-panel-overlay').appendTo('body');
                }

                this._bindEvents();
            }
        },

        _destroy: function () {
            this.panel.remove();
        },

        _bindEvents: function () {
            var $this = this;

            this.element.on('focus.puipassword',function () {
                $this.show();
            }).on('blur.puipassword',function () {
                    $this.hide();
                }).on('keyup.puipassword', function () {
                    var value = $this.element.val(), label = null, meterPos = null;

                    if (value.length == 0) {
                        label = $this.options.promptLabel;
                        meterPos = '0px 0px';
                    } else {
                        var score = $this._testStrength($this.element.val());

                        if (score < 30) {
                            label = $this.options.weakLabel;
                            meterPos = '0px -10px';
                        } else if (score >= 30 && score < 80) {
                            label = $this.options.goodLabel;
                            meterPos = '0px -20px';
                        } else if (score >= 80) {
                            label = $this.options.strongLabel;
                            meterPos = '0px -30px';
                        }
                    }

                    $this.meter.css('background-position', meterPos);
                    $this.infoText.text(label);
                });

            if (!this.options.inline) {
                var resizeNS = 'resize.' + this.element.attr('id');
                $(window).unbind(resizeNS).bind(resizeNS, function () {
                    if ($this.panel.is(':visible')) {
                        $this.align();
                    }
                });
            }
        },

        _testStrength: function (str) {
            var grade = 0, val = 0, $this = this;

            val = str.match('[0-9]');
            grade += $this._normalize(val ? val.length : 1 / 4, 1) * 25;

            val = str.match('[a-zA-Z]');
            grade += $this._normalize(val ? val.length : 1 / 2, 3) * 10;

            val = str.match('[!@#$%^&*?_~.,;=]');
            grade += $this._normalize(val ? val.length : 1 / 6, 1) * 35;

            val = str.match('[A-Z]');
            grade += $this._normalize(val ? val.length : 1 / 6, 1) * 30;

            grade *= str.length / 8;

            return grade > 100 ? 100 : grade;
        },

        _normalize: function (x, y) {
            var diff = x - y;

            if (diff <= 0) {
                return x / y;
            } else {
                return 1 + 0.5 * (x / (x + y / 4));
            }
        },

        align: function () {
            this.panel.css({
                left: '',
                top: '',
                'z-index': ++PUI.zindex
            }).position({
                    my: 'left top',
                    at: 'right top',
                    of: this.element
                });
        },

        show: function () {
            if (!this.options.inline) {
                this.align();

                this.panel.fadeIn();
            } else {
                this.panel.slideDown();
            }
        },

        hide: function () {
            if (this.options.inline) {
                this.panel.slideUp();
            } else {
                this.panel.fadeOut();
            }
        }
    });

});;/**
 * PrimeUI radiobutton widget
 */
$(function() {

    var checkedRadios = {};

    $.widget("primeui.puiradiobutton", {
       
        _create: function() {
            this.element.wrap('<div class="pui-radiobutton ui-widget"><div class="ui-helper-hidden-accessible"></div></div>');
            this.container = this.element.parent().parent();
            this.box = $('<div class="pui-radiobutton-box ui-widget pui-radiobutton-relative ui-state-default">').appendTo(this.container);
            this.icon = $('<span class="pui-radiobutton-icon pui-c"></span>').appendTo(this.box);
            this.disabled = this.element.prop('disabled');
            this.label = $('label[for="' + this.element.attr('id') + '"]');
            
            if(this.element.prop('checked')) {
                this.box.addClass('ui-state-active');
                this.icon.addClass('ui-icon ui-icon-bullet');
                checkedRadios[this.element.attr('name')] = this.box;
            }
            
            if(this.disabled) {
                this.box.addClass('ui-state-disabled');
            } else {
                this._bindEvents();
            }
        },
        
        _bindEvents: function() {
            var $this = this;
        
            this.box.on('mouseover.puiradiobutton', function() {
                if(!$this.isChecked())  // Changed for angularPrime (changed visibility)
                    $this.box.addClass('ui-state-hover');
            }).on('mouseout.puiradiobutton', function() {
                if(!$this.isChecked())  // Changed for angularPrime (changed visibility)
                    $this.box.removeClass('ui-state-hover');
            }).on('click.puiradiobutton', function() {
                if(!$this.isChecked()) {// Changed for angularPrime (changed visibility)
                    $this.element.trigger('click');

                    if($.browser.msie && parseInt($.browser.version) < 9) {
                        $this.element.trigger('change');
                    }
                }
            });
            
            if(this.label.length > 0) {
                this.label.on('click.puiradiobutton', function(e) {
                    $this.element.trigger('click');

                    e.preventDefault();
                });
            }
            
            this.element.focus(function() {
                if($this.isChecked()) { // Changed for angularPrime (changed visibility)
                    $this.box.removeClass('ui-state-active');
                }

                $this.box.addClass('ui-state-focus');
            })
            .blur(function() {
                if($this.isChecked()) { // Changed for angularPrime (changed visibility)
                    $this.box.addClass('ui-state-active');
                }

                $this.box.removeClass('ui-state-focus');
            })
            .change(function(e) {
                var name = $this.element.attr('name');
                if(checkedRadios[name]) {
                    checkedRadios[name].removeClass('ui-state-active ui-state-focus ui-state-hover').children('.pui-radiobutton-icon').removeClass('ui-icon ui-icon-bullet');
                }

                $this.icon.addClass('ui-icon ui-icon-bullet');
                if(!$this.element.is(':focus')) {
                    $this.box.addClass('ui-state-active');
                }

                checkedRadios[name] = $this.box;
                
                $this._trigger('change', null);
            });
        },
        
        isChecked: function() {  // Changed visibility for AngularPrime
            return this.element.prop('checked');
        },

        // Added for AngularPrime
        _unbindEvents: function () {
            this.box.off();

            if (this.label.length > 0) {
                this.label.off();
            }
        },

        enable: function () {
            this._bindEvents();
            this.box.removeClass('ui-state-disabled');
        },

        disable: function () {
            this._unbindEvents();
            this.box.addClass('ui-state-disabled');
        }

    });
    
});