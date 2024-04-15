export const BOOL_SIZE = 1;
export const BYTE_SIZE = 1;
export const INT_SIZE = 1;

export enum Type {
  bool = 'bool',
  byte = 'byte',
  int = 'int',

  string = 'string',
  array = 'array',
  pointer = 'pointer',
  function = 'function',
  channel = 'channel',
}

export interface TypeInfo {
  type: Type;
  size: number;
}

export interface BoolTypeInfo extends TypeInfo {
  type: Type.bool;
  size: typeof BOOL_SIZE;
}

export const boolTypeInfo = (): BoolTypeInfo => ({ type: Type.bool, size: BOOL_SIZE });

export interface ByteTypeInfo extends TypeInfo {
  type: Type.byte;
  size: typeof BYTE_SIZE;
}

export const byteTypeInfo = (): ByteTypeInfo => ({ type: Type.byte, size: BYTE_SIZE });

export interface IntTypeInfo extends TypeInfo {
  type: Type.int;
  size: typeof INT_SIZE;
}

export const intTypeInfo = (): IntTypeInfo => ({ type: Type.int, size: INT_SIZE });

export interface StringTypeInfo extends TypeInfo {
  type: Type.string;
  length: number | undefined;
}

export const stringTypeInfo = (): StringTypeInfo => ({
  type: Type.string,
  length: undefined,
  get size() {
    if (this.length === undefined) return -1;
    return this.length * BYTE_SIZE;
  },
});

export interface ArrayTypeInfo extends TypeInfo {
  type: Type.array;
  length: number;
  elType: TypeInfo;
}

export const arrayTypeInfo = (length: number, elType: TypeInfo): ArrayTypeInfo => ({
  type: Type.array,
  length,
  elType,
  get size() {
    return this.length * this.elType.size;
  },
});

export interface PointerTypeInfo extends TypeInfo {
  type: Type.pointer;
  baseType: TypeInfo;
}

export const pointerTypeInfo = (baseType: TypeInfo): PointerTypeInfo => ({
  type: Type.pointer,
  baseType,
  size: INT_SIZE,
});

export interface TypeWithIdentifier {
  type: TypeInfo;
  identifier: string | undefined;
}

export interface FunctionTypeInfo extends TypeInfo {
  type: Type.function;
  paramTypes: TypeWithIdentifier[];
  returnTypes: TypeWithIdentifier[];
  size: -1;
}

export const functionTypeInfo = (
  paramTypes: TypeWithIdentifier[],
  returnTypes: TypeWithIdentifier[]
): FunctionTypeInfo => ({
  type: Type.function,
  paramTypes,
  returnTypes,
  size: -1,
});

export interface ChannelTypeInfo extends TypeInfo {
  type: Type.channel;
  elType: TypeInfo;
}

export const channelTypeInfo = (elType: TypeInfo): ChannelTypeInfo => ({
  type: Type.channel,
  elType,
  size: INT_SIZE,
});

export const IDENTIFIER_TO_TYPEINFO: Record<string, TypeInfo> = {
  bool: boolTypeInfo(),
  byte: byteTypeInfo(),
  int: intTypeInfo(),
  string: stringTypeInfo(),
};

export const getTypeInfoFromIdentifier = (identifier: string): TypeInfo => {
  if (!(identifier in IDENTIFIER_TO_TYPEINFO)) throw new Error('unrecognized typename');
  return IDENTIFIER_TO_TYPEINFO[identifier];
};
