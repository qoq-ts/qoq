import fs from 'fs';
import { File } from 'formidable';
import fileSize from 'filesize';
import { Validator, ValidatorOptions } from './Validator';
import { createHash } from 'crypto';

type FileOmitHash = Omit<File, 'hash' | 'hashAlgorithm'>;

interface FileOptions<T> extends ValidatorOptions<T> {
  hash?: File['hashAlgorithm'];
  multiples?: boolean;
  maxSize?: number;
  mimeTypes?: string[];
}

export interface FileDataType {
  type: 'file';
  validator: 'file';
}

export class FileValidator<T = FileOmitHash> extends Validator<FileOptions<T>> {
  public hash<H extends File['hashAlgorithm']>(
    crypto: H,
  ): FileValidator<
    H extends false
      ? T extends Array<any>
        ? FileOmitHash[]
        : FileOmitHash
      : T extends Array<any>
      ? File[]
      : File
  > {
    this.config.hash = crypto;
    // @ts-expect-error
    return this;
  }

  public multiples(): FileValidator<T[]> {
    this.config.multiples = true;
    // @ts-expect-error
    return this;
  }

  public maxSize(byte: number): this {
    this.config.maxSize = byte;
    return this;
  }

  public allowMimeTypes(types: string[]): this {
    this.config.mimeTypes = types;
    return this;
  }

  declare optional: () => FileValidator<T | undefined>;

  declare transform: <T1>(fn: (file: T) => Promise<T1> | T1) => FileValidator<T1>;

  protected async validateValue(
    data: Record<string, any>,
    key: string,
    superKeys: string[],
  ): Promise<string | void> {
    const { hash, multiples, maxSize, mimeTypes } = this.config;
    let value: File[] = data[key];

    data[key] = value = Array.isArray(value) ? value : [value];

    if (!multiples) {
      if (value.length === 0) {
        return `${this.getLabel(key, superKeys)} is required`;
      }

      value.length = 1;
    }

    for (let i = 0, len = value.length; i < len; ++i) {
      const item: File = value[i]!;

      if (!(item instanceof File)) {
        const label = this.getLabel(i.toString(), superKeys.concat(key));
        return `${label} must be file`;
      }

      if (maxSize !== undefined && item.size > maxSize) {
        const label = this.getLabel(i.toString(), superKeys.concat(key));
        return `${label} size large than ${fileSize(maxSize, { spacer: '' })}`;
      }

      if (mimeTypes && (!item.mimetype || !mimeTypes.includes(item.mimetype))) {
        const label = this.getLabel(i.toString(), superKeys.concat(key));
        return `${label} doesn\'t match given mime types`;
      }

      if (hash) {
        const hashHandle = createHash(hash);
        const stream = fs.createReadStream(item.filepath, {
          flags: 'r',
        });

        item.hash = await new Promise<string>((resolve, reject) => {
          stream.on('data', (chunk) => {
            hashHandle.update(chunk);
          });
          stream.on('end', () => {
            resolve(hashHandle.digest('hex'));
          });
          stream.on('error', (err) => {
            reject(err);
          });
        });
      }
    }

    if (!multiples) {
      data[key] = value[0];
    }
  }

  protected getDataType(): FileDataType {
    return {
      type: 'file',
      validator: 'file',
    };
  }
}
