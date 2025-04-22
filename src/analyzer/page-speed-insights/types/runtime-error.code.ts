/**
 * PageSpeed Insights - RuntimeErrorCode
 * @description Possible runtime error codes from LHR.
 * @category (Analyzer) [PageSpeed Insights]
 */
export enum RuntimeErrorCode {
  /**
   * Document request threw an error.
   */
  ERRORED_DOCUMENT_REQUEST,
  /**
   * Document request failed.
   */ FAILED_DOCUMENT_REQUEST,
  /**
   * Document request is invalid.
   */ INSECURE_DOCUMENT_REQUEST,
  /**
   * Speedline is invalid.
   */ INVALID_SPEEDLINE,
  /**
   * No DCL was found.
   */ NO_DCL,
  /**
   * No Document requested.
   */ NO_DOCUMENT_REQUEST,
  /**
   * No Error occurred.
   */ NO_ERROR,
  /**
   * No FCP was found.
   */ NO_FCP,
  /**
   * No NavStart was found.
   */ NO_NAVSTART,
  /**
   * No Screenshots found.
   */ NO_SCREENSHOTS,
  /**
   * No Speedline Frames found.
   */ NO_SPEEDLINE_FRAMES,
  /**
   * No Tracing was started.
   */ NO_TRACING_STARTED,
  /**
   * Issue occured when parsing a document.
   */ PARSING_PROBLEM,
  /**
   * Protocol timed out.
   */ PROTOCOL_TIMEOUT,
  /**
   * Document read failed.
   */ READ_FAILED,
  /**
   * Speed index was 0.
   */ SPEEDINDEX_OF_ZERO,
  /**
   * Tracing has already started.
   */ TRACING_ALREADY_STARTED,
  /**
   * Unknown Error occured.
   */ UNKNOWN_ERROR,
}
