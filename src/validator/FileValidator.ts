import fs from 'fs';
import formidable from 'formidable';
// @ts-ignore FIXME
import File from 'formidable/lib/file';
import fileSize from 'filesize';
import { Validator, ValidatorOptions } from './Validator';
import { createHash } from 'crypto';

type FileNoHash = Omit<formidable.File, 'hash'>;

interface FileWithHash extends FileNoHash {
  hash: string;
}

interface FileOptions<T> extends ValidatorOptions<T> {
  hash?: 'md5' | 'sha1';
  multiples?: boolean;
  maxSize?: number;
  mimeTypes?: string[];
}

export class FileValidator<T = FileNoHash> extends Validator<FileOptions<T>> {
  public optional(): FileValidator<T | undefined> {
    return super.optional();
  }

  public hash(crypto: 'md5' | 'sha1'): FileValidator<T extends Array<any> ? FileWithHash[] : FileWithHash> {
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

  /**
   * Make sure you call it at the ending of chain.
   */
  transform<T1>(fn: (value: T) => T1): FileValidator<T1> {
    this.config.transform = fn;
    // @ts-expect-error
    return this;
  }

  protected validateValue(obj: Record<string, any>, key: string, superKeys: string[]): string | void {
    const { hash, multiples, maxSize, mimeTypes } = this.config;
    let value: formidable.File[] = obj[key];

    obj[key] = value = Array.isArray(value) ? value : [value];

    if (!multiples) {
      if (value.length === 0) {
        return `${this.getLabel(key, superKeys)} is required`;
      }

      value.splice(1);
    }

    for (let i = 0, len = value.length; i < len; ++i) {
      const item: formidable.File = value[i]!;

      if (!(item instanceof File)) {
        const label = this.getLabel(i.toString(), superKeys.concat(key));
        return `${label} must be file`;
      }

      if (maxSize !== undefined && item.size > maxSize) {
        const label = this.getLabel(i.toString(), superKeys.concat(key));
        return `${label} size large than ${fileSize(maxSize, { spacer: '' })}`;
      }

      if (mimeTypes && (!item.type || !mimeTypes.includes(item.type))) {
        const label = this.getLabel(i.toString(), superKeys.concat(key));
        return `${label} doesn\'t match given mime types`;
      }

      if (hash) {
        item.hash = createHash(hash)
          .update(fs.readFileSync(item.path))
          .digest('hex');
      }
    }

    if (!multiples) {
      obj[key] = value[0];
    }
  }
}
