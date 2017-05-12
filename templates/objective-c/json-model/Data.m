//
//  {{titlecase}}.m
//

#import "{{titlecase}}.h"

{{#properties}}
{{type}} * const {{rucase}}_{{ucase}} = @"{{camelcase}}";
{{/properties}}

@implementation {{titlecase}}


- (instancetype)initWith
                    {{#properties}}
                    {{camelcase}}:({{type}} *){{camelcase}}
                    {{/properties}}
{
    if ((self = [super init])) {

        {{#properties}}
        self.{{camelcase}} = {{camelcase}};
        {{/properties}}
    }
    
    return self;
}


- (instancetype)initWithDictionary:(NSDictionary *)dict
{
    return [self initWith:
                    {{#properties}}
                    {{camelcase}}:dict[{{rucase}}_{{ucase}}]
                    {{/properties}}
                       
            ];
}

- (NSDictionary *)dictionaryRepresentation
{
    return @{
            {{#properties}}
            {{rucase}}_{{ucase}}: self.{{camelcase}}{{^last}},{{/last}}
            {{/properties}}
             };
}

- (NSString *)description
{
    return [NSString stringWithFormat:@"<%@: 0x%x \
            {{#properties}}
            {{camelcase}}=%@ \
            {{/properties}}
            >",
            NSStringFromClass([self class]),
            (unsigned int)self,
            {{#properties}}
            self.{{camelcase}}{{^last}},{{/last}}
            {{/properties}}
            ];
}

@end
