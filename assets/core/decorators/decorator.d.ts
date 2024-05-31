type DecoratorFunc = (
  target: any,
  propertyKey?: string | symbol,
  descriptor?: PropertyDescriptor
) => void;
