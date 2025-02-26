'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _d3Color = require('d3-color');

var _d3Ease = require('d3-ease');

var ease = _interopRequireWildcard(_d3Ease);

var _d3Interpolate = require('d3-interpolate');

var _d3Scale = require('d3-scale');

var _d3Selection = require('d3-selection');

var _d3Shape = require('d3-shape');

var _d3Timer = require('d3-timer');

require('./transition-polyfill');

var _hashid = require('./hashid');

var _Gradient = require('./Gradient');

var _Gradient2 = _interopRequireDefault(_Gradient);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ucfirst = function ucfirst(s) {
    return s && s[0].toUpperCase() + s.slice(1);
};

var LiquidFillGauge = (_temp = _class = function (_PureComponent) {
    _inherits(LiquidFillGauge, _PureComponent);

    function LiquidFillGauge() {
        _classCallCheck(this, LiquidFillGauge);

        return _possibleConstructorReturn(this, (LiquidFillGauge.__proto__ || Object.getPrototypeOf(LiquidFillGauge)).apply(this, arguments));
    }

    _createClass(LiquidFillGauge, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.draw();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            this.draw();
        }
    }, {
        key: 'draw',
        value: function draw() {
            var _this2 = this;

            var data = [];
            var samplePoints = 40;
            for (var i = 0; i <= samplePoints * this.props.waveFrequency; ++i) {
                data.push({
                    x: i / (samplePoints * this.props.waveFrequency),
                    y: i / samplePoints
                });
            }

            this.wave = (0, _d3Selection.select)(this.clipPath).datum(data).attr('T', '0');

            var waveHeightScale = (0, _d3Scale.scaleLinear)().range([0, this.props.waveAmplitude, 0]).domain([0, 50, 100]);

            var fillWidth = this.props.width * (this.props.innerRadius - this.props.margin);
            var waveScaleX = (0, _d3Scale.scaleLinear)().range([-fillWidth, fillWidth]).domain([0, 1]);

            var fillHeight = this.props.height * (this.props.innerRadius - this.props.margin);
            var waveScaleY = (0, _d3Scale.scaleLinear)().range([fillHeight / 2, -fillHeight / 2]).domain([0, 100]);

            if (this.props.waveAnimation) {
                this.animateWave();
            }

            if (this.props.riseAnimation) {
                var clipArea = (0, _d3Shape.area)().x(function (d, i) {
                    return waveScaleX(d.x);
                }).y1(function (d) {
                    return _this2.props.height / 2;
                });
                var timeScale = (0, _d3Scale.scaleLinear)().range([0, 1]).domain([0, this.props.riseAnimationTime]);
                // Use the old value if available
                var interpolate = (0, _d3Interpolate.interpolateNumber)(this.wave.node().oldValue || 0, this.props.value);
                var easing = 'ease' + ucfirst(this.props.riseAnimationEasing);
                var easingFn = ease[easing] ? ease[easing] : ease.easeCubicInOut;
                var riseAnimationTimer = (0, _d3Timer.timer)(function (t) {
                    var value = interpolate(easingFn(timeScale(t)));
                    clipArea.y0(function (d, i) {
                        var radians = Math.PI * 2 * (d.y * 2); // double width
                        return waveScaleY(waveHeightScale(value) * Math.sin(radians) + value);
                    });

                    _this2.wave.attr('d', clipArea);

                    var renderedElement = _this2.props.textRenderer(_extends({}, _this2.props, {
                        value: value
                    }));
                    (0, _d3Selection.select)(_this2.container).selectAll('.text, .waveText').html((0, _server.renderToString)(renderedElement));

                    _this2.props.riseAnimationOnProgress({
                        value: value,
                        container: (0, _d3Selection.select)(_this2.container)
                    });

                    if (t >= _this2.props.riseAnimationTime) {
                        riseAnimationTimer.stop();

                        var _value = interpolate(1);
                        clipArea.y0(function (d, i) {
                            var radians = Math.PI * 2 * (d.y * 2); // double width
                            return waveScaleY(waveHeightScale(_value) * Math.sin(radians) + _value);
                        });

                        _this2.wave.attr('d', clipArea);

                        var _renderedElement = _this2.props.textRenderer(_extends({}, _this2.props, {
                            value: _value
                        }));
                        (0, _d3Selection.select)(_this2.container).selectAll('.text, .waveText').html((0, _server.renderToString)(_renderedElement));

                        _this2.props.riseAnimationOnComplete({
                            value: _value,
                            container: (0, _d3Selection.select)(_this2.container)
                        });
                    }
                });

                // Store the old value that can be used for the next animation
                this.wave.node().oldValue = this.props.value;
            } else {
                var value = this.props.value;
                var _clipArea = (0, _d3Shape.area)().x(function (d, i) {
                    return waveScaleX(d.x);
                }).y0(function (d, i) {
                    var radians = Math.PI * 2 * (d.y * 2); // double width
                    return waveScaleY(waveHeightScale(value) * Math.sin(radians) + value);
                }).y1(function (d) {
                    return _this2.props.height / 2;
                });

                this.wave.attr('d', _clipArea);
            }
        }
    }, {
        key: 'animateWave',
        value: function animateWave() {
            var _this3 = this;

            var width = this.props.width * (this.props.innerRadius - this.props.margin) / 2;
            var waveAnimationScale = (0, _d3Scale.scaleLinear)().range([-width, width]).domain([0, 1]);
            var easing = 'ease' + ucfirst(this.props.waveAnimationEasing);
            var easingFn = ease[easing] ? ease[easing] : ease.easeLinear;

            this.wave.attr('transform', 'translate(' + waveAnimationScale(this.wave.attr('T')) + ', 0)').transition().duration(this.props.waveAnimationTime * (1 - this.wave.attr('T'))).ease(easingFn).attr('transform', 'translate(' + waveAnimationScale(1) + ', 0)').attr('T', '1').on('end', function () {
                _this3.wave.attr('T', '0');
                if (_this3.props.waveAnimation) {
                    _this3.animateWave();
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _props = this.props,
                _props$id = _props.id,
                id = _props$id === undefined ? (0, _hashid.generate)() : _props$id,
                style = _props.style;

            var radius = Math.min(this.props.height / 2, this.props.width / 2);
            var fillCircleRadius = radius * (this.props.innerRadius - this.props.margin);
            var cX = this.props.width / 2;
            var cY = this.props.height / 2;
            var fillColor = this.props.waveStyle.fill;
            var gradientStops = this.props.gradientStops || [{
                key: '0%',
                stopColor: (0, _d3Color.color)(fillColor).darker(0.5).toString(),
                stopOpacity: 1,
                offset: '0%'
            }, {
                key: '50%',
                stopColor: fillColor,
                stopOpacity: 0.75,
                offset: '50%'
            }, {
                key: '100%',
                stopColor: (0, _d3Color.color)(fillColor).brighter(0.5).toString(),
                stopOpacity: 0.5,
                offset: '100%'
            }];

            return _react2.default.createElement(
                'div',
                {
                    style: _extends({
                        width: this.props.width,
                        height: this.props.height
                    }, style)
                },
                _react2.default.createElement(
                    'svg',
                    { width: '100%', height: '100%' },
                    _react2.default.createElement(
                        'g',
                        {
                            ref: function ref(c) {
                                _this4.container = c;
                            },
                            transform: 'translate(' + cX + ',' + cY + ')'
                        },
                        _react2.default.createElement(
                            'defs',
                            null,
                            _react2.default.createElement(
                                'clipPath',
                                { id: 'clipWave-' + id },
                                _react2.default.createElement('path', {
                                    ref: function ref(c) {
                                        _this4.clipPath = c;
                                    }
                                })
                            )
                        ),
                        _react2.default.createElement(
                            'text',
                            _extends({
                                className: 'text',
                                style: {
                                    textAnchor: 'middle'
                                },
                                transform: 'translate(' + this.props.textOffsetX + ',' + this.props.textOffsetY + ')'
                            }, this.props.textStyle),
                            this.props.textRenderer(this.props)
                        ),
                        _react2.default.createElement(
                            'g',
                            { clipPath: 'url(#clipWave-' + id + ')' },
                            _react2.default.createElement('rect', _extends({
                                className: 'wave',
                                width: '88%',
                                height: '82.5%',
                                x: fillCircleRadius * -1,
                                y: fillCircleRadius * -1 + 10,
                                rx: 3
                            }, this.props.waveStyle, {
                                fill: this.props.gradient ? 'url(#gradient-' + id + ')' : this.props.waveStyle.fill
                            })),
                            _react2.default.createElement(
                                'text',
                                _extends({
                                    className: 'waveText',
                                    style: {
                                        textAnchor: 'middle'
                                    },
                                    transform: 'translate(' + this.props.textOffsetX + ',' + this.props.textOffsetY + ')'
                                }, this.props.waveTextStyle),
                                this.props.textRenderer(this.props)
                            )
                        ),
                        _react2.default.createElement('rect', {
                            x: fillCircleRadius * -1,
                            y: fillCircleRadius * -1 + 10,
                            width: '88%',
                            height: '82.5%',
                            style: { fill: 'none', stroke: '#cccccc', strokeWidth: '1px', rx: '3px' }
                        })
                    ),
                    _react2.default.createElement(
                        _Gradient2.default,
                        { id: 'gradient-' + id },
                        gradientStops.map(function (stop, index) {
                            if (!_react2.default.isValidElement(stop)) {
                                var key = stop.key || index;
                                return _react2.default.createElement('stop', _extends({ key: key }, stop));
                            }
                            return stop;
                        })
                    )
                )
            );
        }
    }]);

    return LiquidFillGauge;
}(_react.PureComponent), _class.propTypes = {
    // A unique identifier (ID) to identify the element.
    id: _propTypes2.default.string,
    // The width of the component.
    width: _propTypes2.default.number,
    // The height of the component.
    height: _propTypes2.default.number,

    // The percent value (0-100).
    value: _propTypes2.default.number,
    // The percent string (%) or SVG text element.
    percent: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.node]),

    titleText: _propTypes2.default.string,
    currentAmountText: _propTypes2.default.string,
    totalAmountText: _propTypes2.default.string,

    // The relative height of the text to display in the wave circle. A value of 1 equals 50% of the radius of the outer circle.
    textSize: _propTypes2.default.number,
    textOffsetX: _propTypes2.default.number,
    textOffsetY: _propTypes2.default.number,

    // Specifies a custom text renderer for rendering a percent value.
    textRenderer: _propTypes2.default.func,

    // Controls if the wave should rise from 0 to it's full height, or start at it's full height.
    riseAnimation: _propTypes2.default.bool,
    // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
    riseAnimationTime: _propTypes2.default.number,
    // [d3-ease](https://github.com/d3/d3-ease) options:
    // See the [easing explorer](http://bl.ocks.org/mbostock/248bac3b8e354a9103c4) for a visual demostration.
    riseAnimationEasing: _propTypes2.default.string,
    // Progress callback function.
    riseAnimationOnProgress: _propTypes2.default.func,
    // Complete callback function.
    riseAnimationOnComplete: _propTypes2.default.func,

    // Controls if the wave scrolls or is static.
    waveAnimation: _propTypes2.default.bool,
    // The amount of time in milliseconds for a full wave to enter the wave circle.
    waveAnimationTime: _propTypes2.default.number,
    // [d3-ease](https://github.com/d3/d3-ease) options:
    // See the [easing explorer](http://bl.ocks.org/mbostock/248bac3b8e354a9103c4) for a visual demostration.
    waveAnimationEasing: _propTypes2.default.string,

    // The wave amplitude.
    waveAmplitude: _propTypes2.default.number,
    // The number of full waves per width of the wave circle.
    waveFrequency: _propTypes2.default.number,

    // Whether to apply linear gradients to fill the wave circle.
    gradient: _propTypes2.default.bool,
    // An array of the <stop> SVG element defines the ramp of colors to use on a gradient, which is a child element to either the <linearGradient> or the <radialGradient> element.
    gradientStops: _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.object), _propTypes2.default.arrayOf(_propTypes2.default.node), _propTypes2.default.node]),

    // onClick event handler.
    onClick: _propTypes2.default.func,

    // The radius of the inner circle.
    innerRadius: _propTypes2.default.number,
    // The radius of the outer circle.
    outerRadius: _propTypes2.default.number,
    // The size of the gap between the outer circle and wave circle as a percentage of the outer circle's radius.
    margin: _propTypes2.default.number,

    // The fill and stroke of the outer circle.
    circleStyle: _propTypes2.default.object,
    // The fill and stroke of the fill wave.
    waveStyle: _propTypes2.default.object,
    // The fill and stroke of the value text when the wave does not overlap it.
    textStyle: _propTypes2.default.object,
    // The fill and stroke of the value text when the wave overlaps it.
    waveTextStyle: _propTypes2.default.object
}, _class.defaultProps = {
    width: 400,
    height: 400,
    value: 0,
    percent: '%',
    titleText: 'Title',
    currentAmountText: '100 units',
    totalAmountText: '1000 units',
    textSize: 1,
    textOffsetX: 0,
    textOffsetY: 0,
    textRenderer: function textRenderer(props) {
        var value = Math.round(props.value);
        var radius = Math.min(props.height / 2, props.width / 2);
        var textPixels = props.textSize * radius / 2;
        var valueStyle = {
            fontSize: textPixels
        };
        var percentStyle = {
            fontSize: textPixels * 0.6
        };

        return _react2.default.createElement(
            'tspan',
            null,
            _react2.default.createElement(
                'tspan',
                { style: valueStyle },
                value
            ),
            typeof props.percent !== 'string' ? props.percent : _react2.default.createElement(
                'tspan',
                { style: percentStyle },
                props.percent
            )
        );
    },
    riseAnimation: false,
    riseAnimationTime: 2000,
    riseAnimationEasing: 'cubicInOut',
    riseAnimationOnProgress: function riseAnimationOnProgress() {},
    riseAnimationOnComplete: function riseAnimationOnComplete() {},
    waveAnimation: false,
    waveAnimationTime: 2000,
    waveAnimationEasing: 'linear',
    waveAmplitude: 1,
    waveFrequency: 2,
    gradient: false,
    gradientStops: null,
    onClick: function onClick() {},
    innerRadius: 0.9,
    outerRadius: 1.0,
    margin: 0.025,
    circleStyle: {
        fill: 'rgb(23, 139, 202)'
    },
    waveStyle: {
        fill: 'rgb(23, 139, 202)'
    },
    textStyle: {
        fill: 'rgb(0, 0, 0)'
    },
    waveTextStyle: {
        fill: 'rgb(255, 255, 255)'
    }
}, _temp);


module.exports = LiquidFillGauge;