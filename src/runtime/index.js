import StackTraceFilter from './stack_trace_filter'
import FeaturesRunner from './features_runner'
import Parser from './parser'
import EventBroadcaster from './event_broadcaster'

export default class Runtime {
  // options - {dryRun, failFast, filterStacktraces, strict}
  constructor({features, options, supportCodeLibrary}) {
    this.features = features
    this.listeners = []
    this.options = options
    this.supportCodeLibrary = supportCodeLibrary
    this.stackTraceFilter = new StackTraceFilter()
  }

  async start() {
    const eventBroadcaster = new EventBroadcaster({
      listenerDefaultTimeout: supportCodeLibrary.getDefaultTimeout(),
      listeners: this.listeners.concat(supportCodeLibrary.getListeners())
    })
    const featuresRunner = new FeaturesRunner({
      eventBroadcaster,
      features: this.features,
      options: this.options,
      supportCodeLibrary: this.supportCodeLibrary
    })

    if (this.options.filterStacktraces) {
      this.stackTraceFilter.filter()
    }

    const result = await featuresRunner.run()

    if (this.options.filterStacktraces) {
      this.stackTraceFilter.unfilter()
    }

    return result
  }

  attachListener(listener) {
    this.listeners.push(listener)
  }
}
