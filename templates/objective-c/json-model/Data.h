//
//  {{titlecase}}.h
//

#import <Foundation/Foundation.h>

@interface {{titlecase}} : NSObject

{{#properties}}
@property (nonatomic, copy, readwrite) {{type}}* {{camelcase}};
{{/properties}}

/**
 * Create a new instance
 */
- (instancetype)initWith:
                    {{#properties}}
                    {{camelcase}}:({{type}} *){{camelcase}}{{#last}};{{/last}}
                    {{/properties}}

/**
 * Create a new instance from a dictionary
 */
- (instancetype)initWithDictionary:(NSDictionary *)dict;

/**
 * Returns a dictionary representation of the model suitable
 * for JSON serialization
 */
- (NSDictionary *)dictionaryRepresentation;

@end
