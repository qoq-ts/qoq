declare module 'formidable' {
  import http = require("http");
  import stream = require("stream");
  import events = require("events");

  interface Options {
    // Default: 1000
    maxFields?: number;
    // Default: 20 * 1024 * 1024  (20mb)
    maxFieldsSize?: number;
    // Default: 200 * 1024 * 1024  (200mb)
    maxFileSize?: number;
    // Default: false
    keepExtensions?: boolean;
    // Default: utf-8
    encoding?: string;
    // Default: false
    hash?: boolean | 'sha1' | 'md5';
    // Default: os.tmpdir()
    uploadDir?: string;
    // Default: false
    multiples?: boolean;
    // Default: ['octetstream', 'querystring', 'multipart', 'json']
    enabledPlugins?: string[];
  }

  class IncomingForm extends events.EventEmitter {
      encoding: string;
      uploadDir: string;
      keepExtensions: boolean;
      maxFileSize: number;
      maxFieldsSize: number;
      maxFields: number;
      hash: string | boolean;
      multiples: boolean;
      type: string;
      bytesReceived: number;
      bytesExpected: number;

      constructor(options: Options);

      onPart: (part: Part) => void;

      handlePart(part: Part): void;
      parse(req: http.IncomingMessage, callback?: (err: Error | null, fields: Fields, files: Files) => any): void;
  }

  interface Fields {
      [key: string]: string|Array<string>;
  }

  interface Files {
      [key: string]: File | File[];
  }

  interface Part extends stream.Stream {
      headers: { [key: string]: string };
      name: string;
      filename?: string;
      mime?: string;
  }

  class File {
      size: number;
      path: string;
      name: string;
      type: string;
      mtime: Date;
      hash?: string;

      toJSON(): Object;
  }
}
