"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getControllers = getControllers;
exports.getLoggerController = getLoggerController;
exports.getFilesController = getFilesController;
exports.getUserController = getUserController;
exports.getCacheController = getCacheController;
exports.getParseGraphQLController = getParseGraphQLController;
exports.getAnalyticsController = getAnalyticsController;
exports.getLiveQueryController = getLiveQueryController;
exports.getDatabaseController = getDatabaseController;
exports.getHooksController = getHooksController;
exports.getPushController = getPushController;
exports.getAuthDataManager = getAuthDataManager;
exports.getDatabaseAdapter = getDatabaseAdapter;

var _Auth = _interopRequireDefault(require("../Adapters/Auth"));

var _Options = require("../Options");

var _AdapterLoader = require("../Adapters/AdapterLoader");

var _defaults = _interopRequireDefault(require("../defaults"));

var _url = _interopRequireDefault(require("url"));

var _LoggerController = require("./LoggerController");

var _FilesController = require("./FilesController");

var _HooksController = require("./HooksController");

var _UserController = require("./UserController");

var _CacheController = require("./CacheController");

var _LiveQueryController = require("./LiveQueryController");

var _AnalyticsController = require("./AnalyticsController");

var _PushController = require("./PushController");

var _PushQueue = require("../Push/PushQueue");

var _PushWorker = require("../Push/PushWorker");

var _DatabaseController = _interopRequireDefault(require("./DatabaseController"));

var _SchemaCache = _interopRequireDefault(require("./SchemaCache"));

var _GridFSBucketAdapter = require("../Adapters/Files/GridFSBucketAdapter");

var _WinstonLoggerAdapter = require("../Adapters/Logger/WinstonLoggerAdapter");

var _InMemoryCacheAdapter = require("../Adapters/Cache/InMemoryCacheAdapter");

var _AnalyticsAdapter = require("../Adapters/Analytics/AnalyticsAdapter");

var _MongoStorageAdapter = _interopRequireDefault(require("../Adapters/Storage/Mongo/MongoStorageAdapter"));

var _PostgresStorageAdapter = _interopRequireDefault(require("../Adapters/Storage/Postgres/PostgresStorageAdapter"));

var _pushAdapter = _interopRequireDefault(require("@parse/push-adapter"));

var _ParseGraphQLController = _interopRequireDefault(require("./ParseGraphQLController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getControllers(options) {
  const loggerController = getLoggerController(options);
  const filesController = getFilesController(options);
  const userController = getUserController(options);
  const {
    pushController,
    hasPushScheduledSupport,
    hasPushSupport,
    pushControllerQueue,
    pushWorker
  } = getPushController(options);
  const cacheController = getCacheController(options);
  const analyticsController = getAnalyticsController(options);
  const liveQueryController = getLiveQueryController(options);
  const databaseController = getDatabaseController(options, cacheController);
  const hooksController = getHooksController(options, databaseController);
  const authDataManager = getAuthDataManager(options);
  const parseGraphQLController = getParseGraphQLController(options, {
    databaseController,
    cacheController
  });
  return {
    loggerController,
    filesController,
    userController,
    pushController,
    hasPushScheduledSupport,
    hasPushSupport,
    pushWorker,
    pushControllerQueue,
    analyticsController,
    cacheController,
    parseGraphQLController,
    liveQueryController,
    databaseController,
    hooksController,
    authDataManager
  };
}

function getLoggerController(options) {
  const {
    appId,
    jsonLogs,
    logsFolder,
    verbose,
    logLevel,
    maxLogFiles,
    silent,
    loggerAdapter
  } = options;
  const loggerOptions = {
    jsonLogs,
    logsFolder,
    verbose,
    logLevel,
    silent,
    maxLogFiles
  };
  const loggerControllerAdapter = (0, _AdapterLoader.loadAdapter)(loggerAdapter, _WinstonLoggerAdapter.WinstonLoggerAdapter, loggerOptions);
  return new _LoggerController.LoggerController(loggerControllerAdapter, appId, loggerOptions);
}

function getFilesController(options) {
  const {
    appId,
    databaseURI,
    filesAdapter,
    databaseAdapter,
    preserveFileName,
    fileKey
  } = options;

  if (!filesAdapter && databaseAdapter) {
    throw 'When using an explicit database adapter, you must also use an explicit filesAdapter.';
  }

  const filesControllerAdapter = (0, _AdapterLoader.loadAdapter)(filesAdapter, () => {
    return new _GridFSBucketAdapter.GridFSBucketAdapter(databaseURI, {}, fileKey);
  });
  return new _FilesController.FilesController(filesControllerAdapter, appId, {
    preserveFileName
  });
}

function getUserController(options) {
  const {
    appId,
    emailAdapter,
    verifyUserEmails
  } = options;
  const emailControllerAdapter = (0, _AdapterLoader.loadAdapter)(emailAdapter);
  return new _UserController.UserController(emailControllerAdapter, appId, {
    verifyUserEmails
  });
}

function getCacheController(options) {
  const {
    appId,
    cacheAdapter,
    cacheTTL,
    cacheMaxSize
  } = options;
  const cacheControllerAdapter = (0, _AdapterLoader.loadAdapter)(cacheAdapter, _InMemoryCacheAdapter.InMemoryCacheAdapter, {
    appId: appId,
    ttl: cacheTTL,
    maxSize: cacheMaxSize
  });
  return new _CacheController.CacheController(cacheControllerAdapter, appId);
}

function getParseGraphQLController(options, controllerDeps) {
  return new _ParseGraphQLController.default(_objectSpread({
    mountGraphQL: options.mountGraphQL
  }, controllerDeps));
}

function getAnalyticsController(options) {
  const {
    analyticsAdapter
  } = options;
  const analyticsControllerAdapter = (0, _AdapterLoader.loadAdapter)(analyticsAdapter, _AnalyticsAdapter.AnalyticsAdapter);
  return new _AnalyticsController.AnalyticsController(analyticsControllerAdapter);
}

function getLiveQueryController(options) {
  return new _LiveQueryController.LiveQueryController(options.liveQuery);
}

function getDatabaseController(options, cacheController) {
  const {
    databaseURI,
    databaseOptions,
    collectionPrefix,
    schemaCacheTTL,
    enableSingleSchemaCache
  } = options;
  let {
    databaseAdapter
  } = options;

  if ((databaseOptions || databaseURI && databaseURI !== _defaults.default.databaseURI || collectionPrefix !== _defaults.default.collectionPrefix) && databaseAdapter) {
    throw 'You cannot specify both a databaseAdapter and a databaseURI/databaseOptions/collectionPrefix.';
  } else if (!databaseAdapter) {
    databaseAdapter = getDatabaseAdapter(databaseURI, collectionPrefix, databaseOptions);
  } else {
    databaseAdapter = (0, _AdapterLoader.loadAdapter)(databaseAdapter);
  }

  return new _DatabaseController.default(databaseAdapter, new _SchemaCache.default(cacheController, schemaCacheTTL, enableSingleSchemaCache));
}

function getHooksController(options, databaseController) {
  const {
    appId,
    webhookKey
  } = options;
  return new _HooksController.HooksController(appId, databaseController, webhookKey);
}

function getPushController(options) {
  const {
    scheduledPush,
    push
  } = options;
  const pushOptions = Object.assign({}, push);
  const pushQueueOptions = pushOptions.queueOptions || {};

  if (pushOptions.queueOptions) {
    delete pushOptions.queueOptions;
  } // Pass the push options too as it works with the default


  const pushAdapter = (0, _AdapterLoader.loadAdapter)(pushOptions && pushOptions.adapter, _pushAdapter.default, pushOptions); // We pass the options and the base class for the adatper,
  // Note that passing an instance would work too

  const pushController = new _PushController.PushController();
  const hasPushSupport = !!(pushAdapter && push);
  const hasPushScheduledSupport = hasPushSupport && scheduledPush === true;
  const {
    disablePushWorker
  } = pushQueueOptions;
  const pushControllerQueue = new _PushQueue.PushQueue(pushQueueOptions);
  let pushWorker;

  if (!disablePushWorker) {
    pushWorker = new _PushWorker.PushWorker(pushAdapter, pushQueueOptions);
  }

  return {
    pushController,
    hasPushSupport,
    hasPushScheduledSupport,
    pushControllerQueue,
    pushWorker
  };
}

function getAuthDataManager(options) {
  const {
    auth,
    enableAnonymousUsers
  } = options;
  return (0, _Auth.default)(auth, enableAnonymousUsers);
}

function getDatabaseAdapter(databaseURI, collectionPrefix, databaseOptions) {
  let protocol;

  try {
    const parsedURI = _url.default.parse(databaseURI);

    protocol = parsedURI.protocol ? parsedURI.protocol.toLowerCase() : null;
  } catch (e) {
    /* */
  }

  switch (protocol) {
    case 'postgres:':
      return new _PostgresStorageAdapter.default({
        uri: databaseURI,
        collectionPrefix,
        databaseOptions
      });

    default:
      return new _MongoStorageAdapter.default({
        uri: databaseURI,
        collectionPrefix,
        mongoOptions: databaseOptions
      });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVycy9pbmRleC5qcyJdLCJuYW1lcyI6WyJnZXRDb250cm9sbGVycyIsIm9wdGlvbnMiLCJsb2dnZXJDb250cm9sbGVyIiwiZ2V0TG9nZ2VyQ29udHJvbGxlciIsImZpbGVzQ29udHJvbGxlciIsImdldEZpbGVzQ29udHJvbGxlciIsInVzZXJDb250cm9sbGVyIiwiZ2V0VXNlckNvbnRyb2xsZXIiLCJwdXNoQ29udHJvbGxlciIsImhhc1B1c2hTY2hlZHVsZWRTdXBwb3J0IiwiaGFzUHVzaFN1cHBvcnQiLCJwdXNoQ29udHJvbGxlclF1ZXVlIiwicHVzaFdvcmtlciIsImdldFB1c2hDb250cm9sbGVyIiwiY2FjaGVDb250cm9sbGVyIiwiZ2V0Q2FjaGVDb250cm9sbGVyIiwiYW5hbHl0aWNzQ29udHJvbGxlciIsImdldEFuYWx5dGljc0NvbnRyb2xsZXIiLCJsaXZlUXVlcnlDb250cm9sbGVyIiwiZ2V0TGl2ZVF1ZXJ5Q29udHJvbGxlciIsImRhdGFiYXNlQ29udHJvbGxlciIsImdldERhdGFiYXNlQ29udHJvbGxlciIsImhvb2tzQ29udHJvbGxlciIsImdldEhvb2tzQ29udHJvbGxlciIsImF1dGhEYXRhTWFuYWdlciIsImdldEF1dGhEYXRhTWFuYWdlciIsInBhcnNlR3JhcGhRTENvbnRyb2xsZXIiLCJnZXRQYXJzZUdyYXBoUUxDb250cm9sbGVyIiwiYXBwSWQiLCJqc29uTG9ncyIsImxvZ3NGb2xkZXIiLCJ2ZXJib3NlIiwibG9nTGV2ZWwiLCJtYXhMb2dGaWxlcyIsInNpbGVudCIsImxvZ2dlckFkYXB0ZXIiLCJsb2dnZXJPcHRpb25zIiwibG9nZ2VyQ29udHJvbGxlckFkYXB0ZXIiLCJXaW5zdG9uTG9nZ2VyQWRhcHRlciIsIkxvZ2dlckNvbnRyb2xsZXIiLCJkYXRhYmFzZVVSSSIsImZpbGVzQWRhcHRlciIsImRhdGFiYXNlQWRhcHRlciIsInByZXNlcnZlRmlsZU5hbWUiLCJmaWxlS2V5IiwiZmlsZXNDb250cm9sbGVyQWRhcHRlciIsIkdyaWRGU0J1Y2tldEFkYXB0ZXIiLCJGaWxlc0NvbnRyb2xsZXIiLCJlbWFpbEFkYXB0ZXIiLCJ2ZXJpZnlVc2VyRW1haWxzIiwiZW1haWxDb250cm9sbGVyQWRhcHRlciIsIlVzZXJDb250cm9sbGVyIiwiY2FjaGVBZGFwdGVyIiwiY2FjaGVUVEwiLCJjYWNoZU1heFNpemUiLCJjYWNoZUNvbnRyb2xsZXJBZGFwdGVyIiwiSW5NZW1vcnlDYWNoZUFkYXB0ZXIiLCJ0dGwiLCJtYXhTaXplIiwiQ2FjaGVDb250cm9sbGVyIiwiY29udHJvbGxlckRlcHMiLCJQYXJzZUdyYXBoUUxDb250cm9sbGVyIiwibW91bnRHcmFwaFFMIiwiYW5hbHl0aWNzQWRhcHRlciIsImFuYWx5dGljc0NvbnRyb2xsZXJBZGFwdGVyIiwiQW5hbHl0aWNzQWRhcHRlciIsIkFuYWx5dGljc0NvbnRyb2xsZXIiLCJMaXZlUXVlcnlDb250cm9sbGVyIiwibGl2ZVF1ZXJ5IiwiZGF0YWJhc2VPcHRpb25zIiwiY29sbGVjdGlvblByZWZpeCIsInNjaGVtYUNhY2hlVFRMIiwiZW5hYmxlU2luZ2xlU2NoZW1hQ2FjaGUiLCJkZWZhdWx0cyIsImdldERhdGFiYXNlQWRhcHRlciIsIkRhdGFiYXNlQ29udHJvbGxlciIsIlNjaGVtYUNhY2hlIiwid2ViaG9va0tleSIsIkhvb2tzQ29udHJvbGxlciIsInNjaGVkdWxlZFB1c2giLCJwdXNoIiwicHVzaE9wdGlvbnMiLCJPYmplY3QiLCJhc3NpZ24iLCJwdXNoUXVldWVPcHRpb25zIiwicXVldWVPcHRpb25zIiwicHVzaEFkYXB0ZXIiLCJhZGFwdGVyIiwiUGFyc2VQdXNoQWRhcHRlciIsIlB1c2hDb250cm9sbGVyIiwiZGlzYWJsZVB1c2hXb3JrZXIiLCJQdXNoUXVldWUiLCJQdXNoV29ya2VyIiwiYXV0aCIsImVuYWJsZUFub255bW91c1VzZXJzIiwicHJvdG9jb2wiLCJwYXJzZWRVUkkiLCJ1cmwiLCJwYXJzZSIsInRvTG93ZXJDYXNlIiwiZSIsIlBvc3RncmVzU3Rv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QUEsR0FBRyxFQUFFOUQsV0FEMkI7QUFFaEM4QixRQUFBQSxnQkFGZ0M7QUFHaENELFFBQUFBO0FBSGdDLE9BQTNCLENBQVA7O0FBS0Y7QUFDRSxhQUFPLElBQUlrQyw0QkFBSixDQUF3QjtBQUM3QkQsUUFBQUEsR0FBRyxFQUFFOUQsV0FEd0I7QUFFN0I4QixRQUFBQSxnQkFGNkI7QUFHN0JrQyxRQUFBQSxZQUFZLEVBQUVuQztBQUhlLE9BQXhCLENBQVA7QUFSSjtBQWNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGF1dGhEYXRhTWFuYWdlciBmcm9tICcuLi9BZGFwdGVycy9BdXRoJztcbmltcG9ydCB7IFBhcnNlU2VydmVyT3B0aW9ucyB9IGZyb20gJy4uL09wdGlvbnMnO1xuaW1wb3J0IHsgbG9hZEFkYXB0ZXIgfSBmcm9tICcuLi9BZGFwdGVycy9BZGFwdGVyTG9hZGVyJztcbmltcG9ydCBkZWZhdWx0cyBmcm9tICcuLi9kZWZhdWx0cyc7XG5pbXBvcnQgdXJsIGZyb20gJ3VybCc7XG4vLyBDb250cm9sbGVyc1xuaW1wb3J0IHsgTG9nZ2VyQ29udHJvbGxlciB9IGZyb20gJy4vTG9nZ2VyQ29udHJvbGxlcic7XG5pbXBvcnQgeyBGaWxlc0NvbnRyb2xsZXIgfSBmcm9tICcuL0ZpbGVzQ29udHJvbGxlcic7XG5pbXBvcnQgeyBIb29rc0NvbnRyb2xsZXIgfSBmcm9tICcuL0hvb2tzQ29udHJvbGxlcic7XG5pbXBvcnQgeyBVc2VyQ29udHJvbGxlciB9IGZyb20gJy4vVXNlckNvbnRyb2xsZXInO1xuaW1wb3J0IHsgQ2FjaGVDb250cm9sbGVyIH0gZnJvbSAnLi9DYWNoZUNvbnRyb2xsZXInO1xuaW1wb3J0IHsgTGl2ZVF1ZXJ5Q29udHJvbGxlciB9IGZyb20gJy4vTGl2ZVF1ZXJ5Q29udHJvbGxlcic7XG5pbXBvcnQgeyBBbmFseXRpY3NDb250cm9sbGVyIH0gZnJvbSAnLi9BbmFseXRpY3NDb250cm9sbGVyJztcbmltcG9ydCB7IFB1c2hDb250cm9sbGVyIH0gZnJvbSAnLi9QdXNoQ29udHJvbGxlcic7XG5pbXBvcnQgeyBQdXNoUXVldWUgfSBmcm9tICcuLi9QdXNoL1B1c2hRdWV1ZSc7XG5pbXBvcnQgeyBQdXNoV29ya2VyIH0gZnJvbSAnLi4vUHVzaC9QdXNoV29ya2VyJztcbmltcG9ydCBEYXRhYmFzZUNvbnRyb2xsZXIgZnJvbSAnLi9EYXRhYmFzZUNvbnRyb2xsZXInO1xuaW1wb3J0IFNjaGVtYUNhY2hlIGZyb20gJy4vU2NoZW1hQ2FjaGUnO1xuXG4vLyBBZGFwdGVyc1xuaW1wb3J0IHsgR3JpZEZTQnVja2V0QWRhcHRlciB9IGZyb20gJy4uL0FkYXB0ZXJzL0ZpbGVzL0dyaWRGU0J1Y2tldEFkYXB0ZXInO1xuaW1wb3J0IHsgV2luc3RvbkxvZ2dlckFkYXB0ZXIgfSBmcm9tICcuLi9BZGFwdGVycy9Mb2dnZXIvV2luc3RvbkxvZ2dlckFkYXB0ZXInO1xuaW1wb3J0IHsgSW5NZW1vcnlDYWNoZUFkYXB0ZXIgfSBmcm9tICcuLi9BZGFwdGVycy9DYWNoZS9Jbk1lbW9yeUNhY2hlQWRhcHRlcic7XG5pbXBvcnQgeyBBbmFseXRpY3NBZGFwdGVyIH0gZnJvbSAnLi4vQWRhcHRlcnMvQW5hbHl0aWNzL0FuYWx5dGljc0FkYXB0ZXInO1xuaW1wb3J0IE1vbmdvU3RvcmFnZUFkYXB0ZXIgZnJvbSAnLi4vQWRhcHRlcnMvU3RvcmFnZS9Nb25nby9Nb25nb1N0b3JhZ2VBZGFwdGVyJztcbmltcG9ydCBQb3N0Z3Jlc1N0b3JhZ2VBZGFwdGVyIGZyb20gJy4uL0FkYXB0ZXJzL1N0b3JhZ2UvUG9zdGdyZXMvUG9zdGdyZXNTdG9yYWdlQWRhcHRlcic7XG5pbXBvcnQgUGFyc2VQdXNoQWRhcHRlciBmcm9tICdAcGFyc2UvcHVzaC1hZGFwdGVyJztcbmltcG9ydCBQYXJzZUdyYXBoUUxDb250cm9sbGVyIGZyb20gJy4vUGFyc2VHcmFwaFFMQ29udHJvbGxlcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250cm9sbGVycyhvcHRpb25zOiBQYXJzZVNlcnZlck9wdGlvbnMpIHtcbiAgY29uc3QgbG9nZ2VyQ29udHJvbGxlciA9IGdldExvZ2dlckNvbnRyb2xsZXIob3B0aW9ucyk7XG4gIGNvbnN0IGZpbGVzQ29udHJvbGxlciA9IGdldEZpbGVzQ29udHJvbGxlcihvcHRpb25zKTtcbiAgY29uc3QgdXNlckNvbnRyb2xsZXIgPSBnZXRVc2VyQ29udHJvbGxlcihvcHRpb25zKTtcbiAgY29uc3Qge1xuICAgIHB1c2hDb250cm9sbGVyLFxuICAgIGhhc1B1c2hTY2hlZHVsZWRTdXBwb3J0LFxuICAgIGhhc1B1c2hTdXBwb3J0LFxuICAgIHB1c2hDb250cm9sbGVyUXVldWUsXG4gICAgcHVzaFdvcmtlcixcbiAgfSA9IGdldFB1c2hDb250cm9sbGVyKG9wdGlvbnMpO1xuICBjb25zdCBjYWNoZUNvbnRyb2xsZXIgPSBnZXRDYWNoZUNvbnRyb2xsZXIob3B0aW9ucyk7XG4gIGNvbnN0IGFuYWx5dGljc0NvbnRyb2xsZXIgPSBnZXRBbmFseXRpY3NDb250cm9sbGVyKG9wdGlvbnMpO1xuICBjb25zdCBsaXZlUXVlcnlDb250cm9sbGVyID0gZ2V0TGl2ZVF1ZXJ5Q29udHJvbGxlcihvcHRpb25zKTtcbiAgY29uc3QgZGF0YWJhc2VDb250cm9sbGVyID0gZ2V0RGF0YWJhc2VDb250cm9sbGVyKG9wdGlvbnMsIGNhY2hlQ29udHJvbGxlcik7XG4gIGNvbnN0IGhvb2tzQ29udHJvbGxlciA9IGdldEhvb2tzQ29udHJvbGxlcihvcHRpb25zLCBkYXRhYmFzZUNvbnRyb2xsZXIpO1xuICBjb25zdCBhdXRoRGF0YU1hbmFnZXIgPSBnZXRBdXRoRGF0YU1hbmFnZXIob3B0aW9ucyk7XG4gIGNvbnN0IHBhcnNlR3JhcGhRTENvbnRyb2xsZXIgPSBnZXRQYXJzZUdyYXBoUUxDb250cm9sbGVyKG9wdGlvbnMsIHtcbiAgICBkYXRhYmFzZUNvbnRyb2xsZXIsXG4gICAgY2FjaGVDb250cm9sbGVyLFxuICB9KTtcbiAgcmV0dXJuIHtcbiAgICBsb2dnZXJDb250cm9sbGVyLFxuICAgIGZpbGVzQ29udHJvbGxlcixcbiAgICB1c2VyQ29udHJvbGxlcixcbiAgICBwdXNoQ29udHJvbGxlcixcbiAgICBoYXNQdXNoU2NoZWR1bGVkU3VwcG9ydCxcbiAgICBoYXNQdXNoU3VwcG9ydCxcbiAgICBwdXNoV29ya2VyLFxuICAgIHB1c2hDb250cm9sbGVyUXVldWUsXG4gICAgYW5hbHl0aWNzQ29udHJvbGxlcixcbiAgICBjYWNoZUNvbnRyb2xsZXIsXG4gICAgcGFyc2VHcmFwaFFMQ29udHJvbGxlcixcbiAgICBsaXZlUXVlcnlDb250cm9sbGVyLFxuICAgIGRhdGFiYXNlQ29udHJvbGxlcixcbiAgICBob29rc0NvbnRyb2xsZXIsXG4gICAgYXV0aERhdGFNYW5hZ2VyLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9nZ2VyQ29udHJvbGxlcihvcHRpb25zOiBQYXJzZVNlcnZlck9wdGlvbnMpOiBMb2dnZXJDb250cm9sbGVyIHtcbiAgY29uc3Qge1xuICAgIGFwcElkLFxuICAgIGpzb25Mb2dzLFxuICAgIGxvZ3NGb2xkZXIsXG4gICAgdmVyYm9zZSxcbiAgICBsb2dMZXZlbCxcbiAgICBtYXhMb2dGaWxlcyxcbiAgICBzaWxlbnQsXG4gICAgbG9nZ2VyQWRhcHRlcixcbiAgfSA9IG9wdGlvbnM7XG4gIGNvbnN0IGxvZ2dlck9wdGlvbnMgPSB7XG4gICAganNvbkxvZ3MsXG4gICAgbG9nc0ZvbGRlcixcbiAgICB2ZXJib3NlLFxuICAgIGxvZ0xldmVsLFxuICAgIHNpbGVudCxcbiAgICBtYXhMb2dGaWxlcyxcbiAgfTtcbiAgY29uc3QgbG9nZ2VyQ29udHJvbGxlckFkYXB0ZXIgPSBsb2FkQWRhcHRlcihsb2dnZXJBZGFwdGVyLCBXaW5zdG9uTG9nZ2VyQWRhcHRlciwgbG9nZ2VyT3B0aW9ucyk7XG4gIHJldHVybiBuZXcgTG9nZ2VyQ29udHJvbGxlcihsb2dnZXJDb250cm9sbGVyQWRhcHRlciwgYXBwSWQsIGxvZ2dlck9wdGlvbnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZXNDb250cm9sbGVyKG9wdGlvbnM6IFBhcnNlU2VydmVyT3B0aW9ucyk6IEZpbGVzQ29udHJvbGxlciB7XG4gIGNvbnN0IHsgYXBwSWQsIGRhdGFiYXNlVVJJLCBmaWxlc0FkYXB0ZXIsIGRhdGFiYXNlQWRhcHRlciwgcHJlc2VydmVGaWxlTmFtZSwgZmlsZUtleSB9ID0gb3B0aW9ucztcbiAgaWYgKCFmaWxlc0FkYXB0ZXIgJiYgZGF0YWJhc2VBZGFwdGVyKSB7XG4gICAgdGhyb3cgJ1doZW4gdXNpbmcgYW4gZXhwbGljaXQgZGF0YWJhc2UgYWRhcHRlciwgeW91IG11c3QgYWxzbyB1c2UgYW4gZXhwbGljaXQgZmlsZXNBZGFwdGVyLic7XG4gIH1cbiAgY29uc3QgZmlsZXNDb250cm9sbGVyQWRhcHRlciA9IGxvYWRBZGFwdGVyKGZpbGVzQWRhcHRlciwgKCkgPT4ge1xuICAgIHJldHVybiBuZXcgR3JpZEZTQnVja2V0QWRhcHRlcihkYXRhYmFzZVVSSSwge30sIGZpbGVLZXkpO1xuICB9KTtcbiAgcmV0dXJuIG5ldyBGaWxlc0NvbnRyb2xsZXIoZmlsZXNDb250cm9sbGVyQWRhcHRlciwgYXBwSWQsIHtcbiAgICBwcmVzZXJ2ZUZpbGVOYW1lLFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFVzZXJDb250cm9sbGVyKG9wdGlvbnM6IFBhcnNlU2VydmVyT3B0aW9ucyk6IFVzZXJDb250cm9sbGVyIHtcbiAgY29uc3QgeyBhcHBJZCwgZW1haWxBZGFwdGVyLCB2ZXJpZnlVc2VyRW1haWxzIH0gPSBvcHRpb25zO1xuICBjb25zdCBlbWFpbENvbnRyb2xsZXJBZGFwdGVyID0gbG9hZEFkYXB0ZXIoZW1haWxBZGFwdGVyKTtcbiAgcmV0dXJuIG5ldyBVc2VyQ29udHJvbGxlcihlbWFpbENvbnRyb2xsZXJBZGFwdGVyLCBhcHBJZCwge1xuICAgIHZlcmlmeVVzZXJFbWFpbHMsXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FjaGVDb250cm9sbGVyKG9wdGlvbnM6IFBhcnNlU2VydmVyT3B0aW9ucyk6IENhY2hlQ29udHJvbGxlciB7XG4gIGNvbnN0IHsgYXBwSWQsIGNhY2hlQWRhcHRlciwgY2FjaGVUVEwsIGNhY2hlTWF4U2l6ZSB9ID0gb3B0aW9ucztcbiAgY29uc3QgY2FjaGVDb250cm9sbGVyQWRhcHRlciA9IGxvYWRBZGFwdGVyKGNhY2hlQWRhcHRlciwgSW5NZW1vcnlDYWNoZUFkYXB0ZXIsIHtcbiAgICBhcHBJZDogYXBwSWQsXG4gICAgdHRsOiBjYWNoZVRUTCxcbiAgICBtYXhTaXplOiBjYWNoZU1heFNpemUsXG4gIH0pO1xuICByZXR1cm4gbmV3IENhY2hlQ29udHJvbGxlcihjYWNoZUNvbnRyb2xsZXJBZGFwdGVyLCBhcHBJZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXJzZUdyYXBoUUxDb250cm9sbGVyKFxuICBvcHRpb25zOiBQYXJzZVNlcnZlck9wdGlvbnMsXG4gIGNvbnRyb2xsZXJEZXBzXG4pOiBQYXJzZUdyYXBoUUxDb250cm9sbGVyIHtcbiAgcmV0dXJuIG5ldyBQYXJzZUdyYXBoUUxDb250cm9sbGVyKHtcbiAgICBtb3VudEdyYXBoUUw6IG9wdGlvbnMubW91bnRHcmFwaFFMLFxuICAgIC4uLmNvbnRyb2xsZXJEZXBzLFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFuYWx5dGljc0NvbnRyb2xsZXIob3B0aW9uczogUGFyc2VTZXJ2ZXJPcHRpb25zKTogQW5hbHl0aWNzQ29udHJvbGxlciB7XG4gIGNvbnN0IHsgYW5hbHl0aWNzQWRhcHRlciB9ID0gb3B0aW9ucztcbiAgY29uc3QgYW5hbHl0aWNzQ29udHJvbGxlckFkYXB0ZXIgPSBsb2FkQWRhcHRlcihhbmFseXRpY3NBZGFwdGVyLCBBbmFseXRpY3NBZGFwdGVyKTtcbiAgcmV0dXJuIG5ldyBBbmFseXRpY3NDb250cm9sbGVyKGFuYWx5dGljc0NvbnRyb2xsZXJBZGFwdGVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExpdmVRdWVyeUNvbnRyb2xsZXIob3B0aW9uczogUGFyc2VTZXJ2ZXJPcHRpb25zKTogTGl2ZVF1ZXJ5Q29udHJvbGxlciB7XG4gIHJldHVybiBuZXcgTGl2ZVF1ZXJ5Q29udHJvbGxlcihvcHRpb25zLmxpdmVRdWVyeSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREYXRhYmFzZUNvbnRyb2xsZXIoXG4gIG9wdGlvbnM6IFBhcnNlU2VydmVyT3B0aW9ucyxcbiAgY2FjaGVDb250cm9sbGVyOiBDYWNoZUNvbnRyb2xsZXJcbik6IERhdGFiYXNlQ29udHJvbGxlciB7XG4gIGNvbnN0IHtcbiAgICBkYXRhYmFzZVVSSSxcbiAgICBkYXRhYmFzZU9wdGlvbnMsXG4gICAgY29sbGVjdGlvblByZWZpeCxcbiAgICBzY2hlbWFDYWNoZVRUTCxcbiAgICBlbmFibGVTaW5nbGVTY2hlbWFDYWNoZSxcbiAgfSA9IG9wdGlvbnM7XG4gIGxldCB7IGRhdGFiYXNlQWRhcHRlciB9ID0gb3B0aW9ucztcbiAgaWYgKFxuICAgIChkYXRhYmFzZU9wdGlvbnMgfHxcbiAgICAgIChkYXRhYmFzZVVSSSAmJiBkYXRhYmFzZVVSSSAhPT0gZGVmYXVsdHMuZGF0YWJhc2VVUkkpIHx8XG4gICAgICBjb2xsZWN0aW9uUHJlZml4ICE9PSBkZWZhdWx0cy5jb2xsZWN0aW9uUHJlZml4KSAmJlxuICAgIGRhdGFiYXNlQWRhcHRlclxuICApIHtcbiAgICB0aHJvdyAnWW91IGNhbm5vdCBzcGVjaWZ5IGJvdGggYSBkYXRhYmFzZUFkYXB0ZXIgYW5kIGEgZGF0YWJhc2VVUkkvZGF0YWJhc2VPcHRpb25zL2NvbGxlY3Rpb25QcmVmaXguJztcbiAgfSBlbHNlIGlmICghZGF0YWJhc2VBZGFwdGVyKSB7XG4gICAgZGF0YWJhc2VBZGFwdGVyID0gZ2V0RGF0YWJhc2VBZGFwdGVyKGRhdGFiYXNlVVJJLCBjb2xsZWN0aW9uUHJlZml4LCBkYXRhYmFzZU9wdGlvbnMpO1xuICB9IGVsc2Uge1xuICAgIGRhdGFiYXNlQWRhcHRlciA9IGxvYWRBZGFwdGVyKGRhdGFiYXNlQWRhcHRlcik7XG4gIH1cbiAgcmV0dXJuIG5ldyBEYXRhYmFzZUNvbnRyb2xsZXIoXG4gICAgZGF0YWJhc2VBZGFwdGVyLFxuICAgIG5ldyBTY2hlbWFDYWNoZShjYWNoZUNvbnRyb2xsZXIsIHNjaGVtYUNhY2hlVFRMLCBlbmFibGVTaW5nbGVTY2hlbWFDYWNoZSlcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEhvb2tzQ29udHJvbGxlcihcbiAgb3B0aW9uczogUGFyc2VTZXJ2ZXJPcHRpb25zLFxuICBkYXRhYmFzZUNvbnRyb2xsZXI6IERhdGFiYXNlQ29udHJvbGxlclxuKTogSG9va3NDb250cm9sbGVyIHtcbiAgY29uc3QgeyBhcHBJZCwgd2ViaG9va0tleSB9ID0gb3B0aW9ucztcbiAgcmV0dXJuIG5ldyBIb29rc0NvbnRyb2xsZXIoYXBwSWQsIGRhdGFiYXNlQ29udHJvbGxlciwgd2ViaG9va0tleSk7XG59XG5cbmludGVyZmFjZSBQdXNoQ29udHJvbGxpbmcge1xuICBwdXNoQ29udHJvbGxlcjogUHVzaENvbnRyb2xsZXI7XG4gIGhhc1B1c2hTY2hlZHVsZWRTdXBwb3J0OiBib29sZWFuO1xuICBwdXNoQ29udHJvbGxlclF1ZXVlOiBQdXNoUXVldWU7XG4gIHB1c2hXb3JrZXI6IFB1c2hXb3JrZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQdXNoQ29udHJvbGxlcihvcHRpb25zOiBQYXJzZVNlcnZlck9wdGlvbnMpOiBQdXNoQ29udHJvbGxpbmcge1xuICBjb25zdCB7IHNjaGVkdWxlZFB1c2gsIHB1c2ggfSA9IG9wdGlvbnM7XG5cbiAgY29uc3QgcHVzaE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBwdXNoKTtcbiAgY29uc3QgcHVzaFF1ZXVlT3B0aW9ucyA9IHB1c2hPcHRpb25zLnF1ZXVlT3B0aW9ucyB8fCB7fTtcbiAgaWYgKHB1c2hPcHRpb25zLnF1ZXVlT3B0aW9ucykge1xuICAgIGRlbGV0ZSBwdXNoT3B0aW9ucy5xdWV1ZU9wdGlvbnM7XG4gIH1cblxuICAvLyBQYXNzIHRoZSBwdXNoIG9wdGlvbnMgdG9vIGFzIGl0IHdvcmtzIHdpdGggdGhlIGRlZmF1bHRcbiAgY29uc3QgcHVzaEFkYXB0ZXIgPSBsb2FkQWRhcHRlcihcbiAgICBwdXNoT3B0aW9ucyAmJiBwdXNoT3B0aW9ucy5hZGFwdGVyLFxuICAgIFBhcnNlUHVzaEFkYXB0ZXIsXG4gICAgcHVzaE9wdGlvbnNcbiAgKTtcbiAgLy8gV2UgcGFzcyB0aGUgb3B0aW9ucyBhbmQgdGhlIGJhc2UgY2xhc3MgZm9yIHRoZSBhZGF0cGVyLFxuICAvLyBOb3RlIHRoYXQgcGFzc2luZyBhbiBpbnN0YW5jZSB3b3VsZCB3b3JrIHRvb1xuICBjb25zdCBwdXNoQ29udHJvbGxlciA9IG5ldyBQdXNoQ29udHJvbGxlcigpO1xuICBjb25zdCBoYXNQdXNoU3VwcG9ydCA9ICEhKHB1c2hBZGFwdGVyICYmIHB1c2gpO1xuICBjb25zdCBoYXNQdXNoU2NoZWR1bGVkU3VwcG9ydCA9IGhhc1B1c2hTdXBwb3J0ICYmIHNjaGVkdWxlZFB1c2ggPT09IHRydWU7XG5cbiAgY29uc3QgeyBkaXNhYmxlUHVzaFdvcmtlciB9ID0gcHVzaFF1ZXVlT3B0aW9ucztcblxuICBjb25zdCBwdXNoQ29udHJvbGxlclF1ZXVlID0gbmV3IFB1c2hRdWV1ZShwdXNoUXVldWVPcHRpb25zKTtcbiAgbGV0IHB1c2hXb3JrZXI7XG4gIGlmICghZGlzYWJsZVB1c2hXb3JrZXIpIHtcbiAgICBwdXNoV29ya2VyID0gbmV3IFB1c2hXb3JrZXIocHVzaEFkYXB0ZXIsIHB1c2hRdWV1ZU9wdGlvbnMpO1xuICB9XG4gIHJldHVybiB7XG4gICAgcHVzaENvbnRyb2xsZXIsXG4gICAgaGFzUHVzaFN1cHBvcnQsXG4gICAgaGFzUHVzaFNjaGVkdWxlZFN1cHBvcnQsXG4gICAgcHVzaENvbnRyb2xsZXJRdWV1ZSxcbiAgICBwdXNoV29ya2VyLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXV0aERhdGFNYW5hZ2VyKG9wdGlvbnM6IFBhcnNlU2VydmVyT3B0aW9ucykge1xuICBjb25zdCB7IGF1dGgsIGVuYWJsZUFub255bW91c1VzZXJzIH0gPSBvcHRpb25zO1xuICByZXR1cm4gYXV0aERhdGFNYW5hZ2VyKGF1dGgsIGVuYWJsZUFub255bW91c1VzZXJzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERhdGFiYXNlQWRhcHRlcihkYXRhYmFzZVVSSSwgY29sbGVjdGlvblByZWZpeCwgZGF0YWJhc2VPcHRpb25zKSB7XG4gIGxldCBwcm90b2NvbDtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWRVUkkgPSB1cmwucGFyc2UoZGF0YWJhc2VVUkkpO1xuICAgIHByb3RvY29sID0gcGFyc2VkVVJJLnByb3RvY29sID8gcGFyc2VkVVJJLnByb3RvY29sLnRvTG93ZXJDYXNlKCkgOiBudWxsO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLyogKi9cbiAgfVxuICBzd2l0Y2ggKHByb3RvY29sKSB7XG4gICAgY2FzZSAncG9zdGdyZXM6JzpcbiAgICAgIHJldHVybiBuZXcgUG9zdGdyZXNTdG9yYWdlQWRhcHRlcih7XG4gICAgICAgIHVyaTogZGF0YWJhc2VVUkksXG4gICAgICAgIGNvbGxlY3Rpb25QcmVmaXgsXG4gICAgICAgIGRhdGFiYXNlT3B0aW9ucyxcbiAgICAgIH0pO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbmV3IE1vbmdvU3RvcmFnZUFkYXB0ZXIoe1xuICAgICAgICB1cmk6IGRhdGFiYXNlVVJJLFxuICAgICAgICBjb2xsZWN0aW9uUHJlZml4LFxuICAgICAgICBtb25nb09wdGlvbnM6IGRhdGFiYXNlT3B0aW9ucyxcbiAgICAgIH0pO1xuICB9XG59XG4iXX0=