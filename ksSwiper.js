/**
 * Created by robyn add on 2016/2/16.
 */

angular.module('utils.ksSwiper', [])
    .directive('ksSwiperContainer', [
        "$window",
        function($window){
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    onReady: '&',
                    slidesPerView: '=',
                    slidesPerColumn: '=',
                    spaceBetween: '=',
                    parallax: '=',
                    parallaxTransition: '@',
                    paginationIsActive: '=',
                    paginationClickable: '=',
                    paginationType: '@',
                    showNavButtons: '=',
                    showScrollBar: '=',
                    loop: '=',
                    autoplay: '=',
                    initialSlide: '=',
                    containerCls: '@',
                    wrapperCls: '@',
                    paginationCls: '@',
                    slideCls: '@',
                    direction: '@',
                    swiper: '=',
                    overrideParameters: '=',
                    isRemember:'@',
                    rememberStr:'@'
                },
                controller: ['$scope', '$element','$timeout', function($scope, $element, $timeout) {

                    function createUUID() {
                        var s = [];
                        var hexDigits = "0123456789abcdef";
                        for (var i = 0; i < 36; i++) {
                            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
                        }
                        s[14] = "4";
                        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
                        s[8] = s[13] = s[18] = s[23] = "-";

                        var uuid = s.join("");
                        return uuid;
                    }


                    var uuid = createUUID();

                    var storage = window.localStorage;

                    $scope.swiper_uuid = uuid;

                    // directive defaults
                    var params = {
                        slidesPerView: $scope.slidesPerView || 1,
                        slidesPerColumn: $scope.slidesPerColumn || 1,
                        spaceBetween: $scope.spaceBetween || 0,
                        direction: $scope.direction || 'horizontal',
                        loop: $scope.loop || false,
                        initialSlide: $scope.initialSlide || 0,
                        showNavButtons: false,
                        paginationType:$scope.paginationType,
                        lazyLoading:false,
                        preloadImages:true,
                        updateOnImagesReady:true,
                        isRemember:false
                    };

                    if (!angular.isUndefined($scope.autoplay) && typeof $scope.autoplay === 'number') {
                        params = angular.extend({}, params, {
                            autoplay: $scope.autoplay
                        });
                    }

                    if ($scope.paginationIsActive === true) {
                        params = angular.extend({}, params, {
                            paginationClickable: $scope.paginationClickable || true,
                            autoplayDisableOnInteraction:false,
                            pagination: '#paginator-' + $scope.swiper_uuid
                        });
                    }

                    if ($scope.showNavButtons === true) {
                        params.nextButton = '#nextButton-' + $scope.swiper_uuid;
                        params.prevButton = '#prevButton-' + $scope.swiper_uuid;
                    }

                    if ($scope.showScrollBar === true) {
                        params.scrollbar = '#scrollBar-' + $scope.swiper_uuid;
                    }

                    if ($scope.lazyLoading === true) {
                        params = angular.extend({}, params, $scope.lazyLoading);
                    }

                    if ($scope.overrideParameters) {
                        params = angular.extend({}, params, $scope.overrideParameters);
                    }

                    if ($scope.isRemember === "true") {
                        console.log("开启记住原来的位置");

                        var loopIndex = storage.getItem("loopSlideIndex_"+$scope.rememberStr);

                        if(loopIndex == null || loopIndex == "undefined"){
                            loopIndex = $scope.initialSlide;
                        }else{
                            loopIndex = Number(loopIndex,10);
                            params.initialSlide = loopIndex;
                        }

                        console.log("slideIndex",loopIndex);
                    }

                    cirCleInitIimeOut();

                    function timeOutcallback(){
                        var containerElement = $element[0];
                        angular.element(containerElement.querySelector('.swiper-slide')).length>0?initSwiper():cirCleInitIimeOut();
                    }

                    function cirCleInitIimeOut(){
                        $timeout(timeOutcallback,500);
                    }


                    function initSwiper(){
                        var swiper = null;

                        if (angular.isObject($scope.swiper)) {
                            $scope.swiper = new Swiper($element[0].firstChild, params);
                            swiper = $scope.swiper;
                        } else {
                            swiper = new Swiper($element[0].firstChild, params);
                        }

                        if (!angular.isUndefined($scope.onReady)) {
                            $scope.onReady({
                                swiper: swiper
                            });
                        }

                        swiper.on('slideChangeStart', function() {
                            var slideIndex = angular.element($element[0].querySelector('.swiper-slide-active'))
                                .attr('data-swiper-slide-index');
                            //console.log(slideIndex,'slideIndex');

                            storage.setItem("loopSlideIndex_"+$scope.rememberStr,slideIndex);
                        });

                    }

                }],

                link: function(scope, element) {

                    var uuid = scope.swiper_uuid;

                    var paginatorId = "paginator-" + uuid;
                    var prevButtonId = "prevButton-" + uuid;
                    var nextButtonId = "nextButton-" + uuid;
                    var scrollBarId = 'scrollBar-' + uuid;

                    var containerElement = element[0];

                    angular.element(containerElement.querySelector('.swiper-pagination'))
                        .attr('id', paginatorId);

                    angular.element(containerElement.querySelector('.swiper-button-next'))
                        .attr('id', nextButtonId);

                    angular.element(containerElement.querySelector('.swiper-button-prev'))
                        .attr('id', prevButtonId);

                    angular.element(element[0].querySelector('.swiper-scrollbar'))
                        .attr('id', scrollBarId);
                },

                template: '<div class="swiper-container {{containerCls}}">' +
                '<div class="parallax-bg" data-swiper-parallax="{{parallaxTransition}}" ng-show="parallax"></div>' +
                '<div class="swiper-wrapper {{wrapperCls}}" ng-transclude></div>' +
                '<div class="swiper-pagination {{paginationCls}}"></div>' +
                '<div class="swiper-button-next" ng-show="showNavButtons"></div>' +
                '<div class="swiper-button-prev" ng-show="showNavButtons"></div>' +
                '<div class="swiper-scrollbar" ng-show="showScrollBar"></div>' +
                '</div>'
            };
        }
    ])
    .directive('ksSwiperSlide', [
        "$window",
        function($window){
            return {
                restrict: 'E',
                require: '^ksSwiperContainer',
                transclude: true,
                template: '<div class="swiper-slide" ng-transclude></div>',
                replace: true
            };
        }
    ]);
