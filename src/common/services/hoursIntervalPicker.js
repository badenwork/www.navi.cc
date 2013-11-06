(function($, window, document, undefined) {
  'use strict';

  // INTERVALPICKER PUBLIC CLASS DEFINITION
  var Intervalpicker = function(element, options) {
    this.widget = '';
    this.$element = $(element);
    this.defaultStart = options.defaultStart;
    this.defaultStop = options.defaultStop;
    this.disableFocus = options.disableFocus;
    this.isOpen = options.isOpen;
    this.template = options.template;
    this.appendWidgetTo = options.appendWidgetTo;

    this._init();
  };

  Intervalpicker.prototype = {

    constructor: Intervalpicker,

    _init: function() {
      var self = this;

      if (this.$element.parent().hasClass('input-append') || this.$element.parent().hasClass('input-prepend')) {
        this.$element.parent('.input-append, .input-prepend').find('.add-on').on({
          'click.intervalpicker': $.proxy(this.showWidget, this)
        });
        this.$element.on({
          'focus.intervalpicker': $.proxy(this.highlightUnit, this),
          'click.intervalpicker': $.proxy(this.highlightUnit, this),
          'keydown.intervalpicker': $.proxy(this.elementKeydown, this),
          'blur.intervalpicker': $.proxy(this.blurElement, this)
        });
      } else {
        if (this.template) {
          this.$element.on({
            'focus.intervalpicker': $.proxy(this.showWidget, this),
            'click.intervalpicker': $.proxy(this.showWidget, this),
            'blur.intervalpicker': $.proxy(this.blurElement, this)
          });
        } else {
          this.$element.on({
            'focus.intervalpicker': $.proxy(this.highlightUnit, this),
            'click.intervalpicker': $.proxy(this.highlightUnit, this),
            'keydown.intervalpicker': $.proxy(this.elementKeydown, this),
            'blur.intervalpicker': $.proxy(this.blurElement, this)
          });
        }
      }

      if (this.template !== false) {
        this.$widget = $(this.getTemplate()).prependTo(this.$element.parents(this.appendWidgetTo)).on('click', $.proxy(this.widgetClick, this));
      } else {
        this.$widget = false;
      }

      if (this.$widget !== false) {
        this.$widget.find('input').each(function() {
          $(this).on({
            'click.intervalpicker': function() { $(this).select(); },
            'keydown.intervalpicker': $.proxy(self.widgetKeydown, self)
          });
        });
      }

      this.setDefaultStartStop(this.defaultStart,this.defaultStop);
    },

    blurElement: function() {
      this.highlightedUnit = undefined;
      this.updateFromElementVal();
    },

    decrementStart: function() {
        if (this.hourStart > 0) {
            this.hourStart--;
            this.update();
        }
    },
      
    decrementStop: function() {
        if (this.hourStop > this.hourStart + 1) {
            this.hourStop--;
        } else if (this.hourStart > 0) {
            this.hourStart--;
            this.hourStop--;
        }
        this.update();
    },

    elementKeydown: function(e) {
      switch (e.keyCode) {
      case 9: //tab
        this.updateFromElementVal();

        switch (this.highlightedUnit) {
        case 'start':
            e.preventDefault();
            this.highlightNextUnit();
            break;
        case 'stop':
            e.preventDefault();
            this.highlightNextUnit();
            break;
        }
        break;
      case 27: // escape
        this.updateFromElementVal();
        break;
      case 37: // left arrow
        e.preventDefault();
        this.highlightPrevUnit();
        this.updateFromElementVal();
        break;
      case 38: // up arrow
        e.preventDefault();
        switch (this.highlightedUnit) {
        case 'start':
          this.incrementStart();
          this.highlightStart();
          break;
        case 'stop':
          this.incrementStop();
          this.highlightStop();
          break;
        }
        break;
      case 39: // right arrow
        e.preventDefault();
        this.updateFromElementVal();
        this.highlightNextUnit();
        break;
      case 40: // down arrow
        e.preventDefault();
        switch (this.highlightedUnit) {
        case 'start':
          this.decrementStart();
          this.highlightStart();
          break;
        case 'stop':
          this.decrementStop();
          this.highlightStop();
          break;
        }
        break;
      }
    },

    formatTime: function(start, stop) {
      start = start < 10 ? '0' + start : start;
      stop = stop < 10 ? '0' + stop : stop;

      return start + ': 00 - ' + stop + ': 59';
    },

    getCursorPosition: function() {
      var input = this.$element.get(0);

      if ('selectionStart' in input) {// Standard-compliant browsers

        return input.selectionStart;
      } else if (document.selection) {// IE fix
        input.focus();
        var sel = document.selection.createRange(),
          selLen = document.selection.createRange().text.length;

        sel.moveStart('character', - input.value.length);

        return sel.text.length - selLen;
      }
    },

    getTemplate: function() {
      var template,
        startTemplate,
        stopTemplate,
        templateContent;

        startTemplate = '<input type="text" name="start" class="intervalpicker-start" maxlength="2"/>';
        stopTemplate = '<input type="text" name="stop" class="intervalpicker-stop" maxlength="2"/>';

      templateContent = '<table>'+
         '<tr>'+
           '<td><a href="#" data-action="incrementStart"><i class="icon-chevron-up"></i></a></td>'+
           '<td class="separator">&nbsp;</td>'+
           '<td><a href="#" data-action="incrementStop"><i class="icon-chevron-up"></i></a></td>'+
         '</tr>'+
         '<tr>'+
           '<td>'+ startTemplate +'</td> '+
           '<td class="separator">:</td>'+
           '<td>'+ stopTemplate +'</td> '+
         '</tr>'+
         '<tr>'+
           '<td><a href="#" data-action="decrementStart"><i class="icon-chevron-down"></i></a></td>'+
           '<td class="separator"></td>'+
           '<td><a href="#" data-action="decrementStop"><i class="icon-chevron-down"></i></a></td>'+
         '</tr>'+
       '</table>';

      return '<div class="intervalpicker-widget dropdown-menu">'+ templateContent +'</div>';
    },

    getTime: function() {
      return this.formatTime(this.hourStart, this.hourStop);
    },

    hideWidget: function() {
      if (this.isOpen === false) {
        return;
      }

      this.updateFromWidgetInputs();

      this.$element.trigger({
        'type': 'hide.intervalpicker',
        'time': {
          'value': this.getTime(),
          'start': this.hourStart,
          'stop': this.hourStop
        }
      });

      this.$widget.removeClass('open');
        if (this.isOpen === true) {
          this.$widget.removeClass('open');
        }

      $(document).off('mousedown.intervalpicker');

      this.isOpen = false;
    },

    highlightUnit: function() {
      this.position = this.getCursorPosition();
      if (this.position >= 0 && this.position <= 2) {
        this.highlightStart();
      } else if (this.position >= 3 && this.position <= 5) {
        this.highlightStop();
      }
    },

    highlightNextUnit: function() {
      switch (this.highlightedUnit) {
      case 'start':
        this.highlightStop();
        break;
      case 'stop':
        this.highlightStart();
        break;
      }
    },

    highlightPrevUnit: function() {
      switch (this.highlightedUnit) {
      case 'start':
        this.highlightStop();
        break;
      case 'stop':
        this.highlightStart();
        break;
      }
    },

    highlightStart: function() {
      var $element = this.$element.get(0);

      this.highlightedUnit = 'start';

      if ($element.setSelectionRange) {
        setTimeout(function() {
          $element.setSelectionRange(0,2);
        }, 0);
      }
    },

    highlightStop: function() {
      var $element = this.$element.get(0);

      this.highlightedUnit = 'stop';

      if ($element.setSelectionRange) {
        setTimeout(function() {
          $element.setSelectionRange(3,5);
        }, 0);
      }
    },

    incrementStart: function() {
      if (this.hourStart < 23) {
          this.hourStart++;
          if (this.hourStart == this.hourStop) {
              this.hourStop ++;
          }
      }
      this.update();
    },

    incrementStop: function(step) {
      if (this.hourStop < 24) {
            this.hourStop ++;
        }
      this.update();
    },

    remove: function() {
      $('document').off('.intervalpicker');
      if (this.$widget) {
        this.$widget.remove();
      }
      delete this.$element.data().intervalpicker;
    },

    setDefaultStartStop: function(defaultStart, defaultStop){
      if (!this.$element.val()) {
        if (defaultStart === false) {
            this.hourStart = 0;
        } else {
          this.setStart(defaultStart);
        }
        if (defaultStop === false) {
            this.hourStop = 24;
        } else {
          this.setStop(defaultStop);
        }
      } else {
        this.updateFromElementVal();
      }
    },

    setStart: function(start) {
      this.hourStart = start;
        
        if (isNaN(this.hourStart)) {
            this.hourStart = 0;
        }
        if (this.hourStart < 0) {
            this.hourStart = 0;
        } else if (this.hourStart >= 23) {
            this.hourStart = 23;
        }

      this.update();
    },
      
      setStop: function(stop) {
      this.hourStop = stop;
        
        if (isNaN(this.hourStop)) {
            this.hourStop = 0;
        }
        if (this.hourStop < 0) {
            this.hourStop = 0;
        } else if (this.hourStop > 24) {
            this.hourStop = 24;
        }

      this.update();
    },

    showWidget: function() {
      if (this.isOpen) {
        return;
      }

      if (this.$element.is(':disabled')) {
        return;
      }

      var self = this;
      $(document).on('mousedown.intervalpicker', function (e) {
        // Clicked outside the intervalpicker, hide it
        if ($(e.target).closest('.intervalpicker-widget').length === 0) {
          self.hideWidget();
        }
      });

      this.$element.trigger({
        'type': 'show.intervalpicker',
        'time': {
          'value': this.getTime(),
          'start': this.hourStart,
          'stop': this.hourStop
        }
      });

      if (this.disableFocus) {
        this.$element.blur();
      }

      this.updateFromElementVal();

        if (this.isOpen === false) {
          this.$widget.addClass('open');
        }

      this.isOpen = true;
    },

    update: function() {
      this.$element.trigger({
        'type': 'changeTime.intervalpicker',
        'time': {
          'value': this.getTime(),
          'start': this.hourStart,
          'stop': this.hourStop
        }
      });

      this.updateElement();
      this.updateWidget();
    },

    updateElement: function() {
      this.$element.val(this.getTime()).change();
    },
///////////////////////////////////////////////////////////// разобраться
    updateFromElementVal: function() {
        console.log('Warning!! Нерабочая функция : updateFromElementVal');
        this.incrementStart();
        this.incrementStop();
        return;
      /*var val = this.$element.val();

      if (val) {
        this.setTime(val);
      }*/
    },

    updateWidget: function() {
      if (this.$widget === false) {
        return;
      }

      var start = this.hourStart < 10 ? '0' + this.hourStart : this.hourStart,
          stop = this.hourStop < 10 ? '0' + this.hourStop : this.hourStop;
        var stt = this.$widget.find('input.intervalpicker-start');
        this.$widget.find('input.intervalpicker-start').val(start);
        this.$widget.find('input.intervalpicker-stop').val(stop);
    },

    updateFromWidgetInputs: function() {
      if (this.$widget === false) {
        return;
      }
      var start = $('input.intervalpicker-start', this.$widget).val();
      var stop = $('input.intervalpicker-stop', this.$widget).val();

      this.setStart(start);
      this.setStop(stop);
    },

    widgetClick: function(e) {
      e.stopPropagation();
      e.preventDefault();

      var action = $(e.target).closest('a').data('action');
      if (action) {
        this[action]();
      }
    },

    widgetKeydown: function(e) {
      var $input = $(e.target).closest('input'),
          name = $input.attr('name');

      switch (e.keyCode) {
      case 9: //tab
          if (name === 'stop') {
            return this.hideWidget();
          }
        this.updateFromWidgetInputs();
        break;
      case 27: // escape
        this.hideWidget();
        break;
      case 38: // up arrow
        e.preventDefault();
        switch (name) {
        case 'start':
          this.incrementStart();
          break;
        case 'stop':
          this.incrementStop();
          break;
        }
        break;
      case 40: // down arrow
        e.preventDefault();
        switch (name) {
        case 'start':
          this.decrementStart();
          break;
        case 'stop':
          this.decrementStop();
          break;
        }
        break;
      }
    }
  };


  //INTERVALPICKER PLUGIN DEFINITION
  $.fn.intervalpicker = function(option) {
    var args = Array.apply(null, arguments);
    args.shift();
    return this.each(function() {
      var $this = $(this),
        data = $this.data('intervalpicker'),
        options = typeof option === 'object' && option;

      if (!data) {
        $this.data('intervalpicker', (data = new Intervalpicker(this, $.extend({}, $.fn.intervalpicker.defaults, options, $(this).data()))));
      }

      if (typeof option === 'string') {
        data[option].apply(data, args);
      }
    });
  };

  $.fn.intervalpicker.defaults = {
    defaultStart: 0,
    defaultStop: 24,
    disableFocus: false,
    isOpen: false,
    template: 'dropdown',
    appendWidgetTo: '.intervalpicker'
  };

  $.fn.intervalpicker.Constructor = Intervalpicker;

})(jQuery, window, document);