import {
  ApolloError,
  PROTOCOL_ERRORS_SYMBOL,
  graphQLResultHasProtocolErrors
} from "./chunk-DYEFZR5X.js";
import {
  ApolloLink,
  Observable,
  __awaiter,
  __extends,
  __generator
} from "./chunk-LI24QMVF.js";
import "./chunk-EWTE5DHJ.js";

// node_modules/@apollo/client/link/retry/delayFunction.js
function buildDelayFunction(delayOptions) {
  var _a = delayOptions || {}, _b = _a.initial, initial = _b === void 0 ? 300 : _b, _c = _a.jitter, jitter = _c === void 0 ? true : _c, _d = _a.max, max = _d === void 0 ? Infinity : _d;
  var baseDelay = jitter ? initial : initial / 2;
  return function delayFunction(count) {
    var delay = Math.min(max, baseDelay * Math.pow(2, count));
    if (jitter) {
      delay = Math.random() * delay;
    }
    return delay;
  };
}

// node_modules/@apollo/client/link/retry/retryFunction.js
function buildRetryFunction(retryOptions) {
  var _a = retryOptions || {}, retryIf = _a.retryIf, _b = _a.max, max = _b === void 0 ? 5 : _b;
  return function retryFunction(count, operation, error) {
    if (count >= max)
      return false;
    return retryIf ? retryIf(error, operation) : !!error;
  };
}

// node_modules/@apollo/client/link/retry/retryLink.js
var RetryableOperation = (
  /** @class */
  function() {
    function RetryableOperation2(observer, operation, forward, delayFor, retryIf) {
      var _this = this;
      this.observer = observer;
      this.operation = operation;
      this.forward = forward;
      this.delayFor = delayFor;
      this.retryIf = retryIf;
      this.retryCount = 0;
      this.currentSubscription = null;
      this.onError = function(error) {
        return __awaiter(_this, void 0, void 0, function() {
          var shouldRetry;
          return __generator(this, function(_a) {
            switch (_a.label) {
              case 0:
                this.retryCount += 1;
                return [4, this.retryIf(this.retryCount, this.operation, error)];
              case 1:
                shouldRetry = _a.sent();
                if (shouldRetry) {
                  this.scheduleRetry(this.delayFor(this.retryCount, this.operation, error));
                  return [
                    2
                    /*return*/
                  ];
                }
                this.observer.error(error);
                return [
                  2
                  /*return*/
                ];
            }
          });
        });
      };
      this.try();
    }
    RetryableOperation2.prototype.cancel = function() {
      if (this.currentSubscription) {
        this.currentSubscription.unsubscribe();
      }
      clearTimeout(this.timerId);
      this.timerId = void 0;
      this.currentSubscription = null;
    };
    RetryableOperation2.prototype.try = function() {
      var _this = this;
      this.currentSubscription = this.forward(this.operation).subscribe({
        next: function(result) {
          var _a;
          if (graphQLResultHasProtocolErrors(result)) {
            _this.onError(new ApolloError({
              protocolErrors: result.extensions[PROTOCOL_ERRORS_SYMBOL]
            }));
            (_a = _this.currentSubscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
            return;
          }
          _this.observer.next(result);
        },
        error: this.onError,
        complete: this.observer.complete.bind(this.observer)
      });
    };
    RetryableOperation2.prototype.scheduleRetry = function(delay) {
      var _this = this;
      if (this.timerId) {
        throw new Error("RetryLink BUG! Encountered overlapping retries");
      }
      this.timerId = setTimeout(function() {
        _this.timerId = void 0;
        _this.try();
      }, delay);
    };
    return RetryableOperation2;
  }()
);
var RetryLink = (
  /** @class */
  function(_super) {
    __extends(RetryLink2, _super);
    function RetryLink2(options) {
      var _this = _super.call(this) || this;
      var _a = options || {}, attempts = _a.attempts, delay = _a.delay;
      _this.delayFor = typeof delay === "function" ? delay : buildDelayFunction(delay);
      _this.retryIf = typeof attempts === "function" ? attempts : buildRetryFunction(attempts);
      return _this;
    }
    RetryLink2.prototype.request = function(operation, nextLink) {
      var _this = this;
      return new Observable(function(observer) {
        var retryable = new RetryableOperation(observer, operation, nextLink, _this.delayFor, _this.retryIf);
        return function() {
          retryable.cancel();
        };
      });
    };
    return RetryLink2;
  }(ApolloLink)
);
export {
  RetryLink
};
//# sourceMappingURL=@apollo_client_link_retry.js.map
