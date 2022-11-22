import { Label } from "./label"
import { assertIsFromEnum, assertIsNonEmptyString } from "./utils"

export enum FindingSeverity {
  Unknown,
  Info,
  Low,
  Medium,
  High,
  Critical
}

export enum FindingType {
  Unknown,
  Exploit,
  Suspicious,
  Degraded,
  Info
}

type FindingInput = {
  name: string,
  description: string,
  alertId: string,
  protocol?: string,
  severity: FindingSeverity,
  type: FindingType,
  metadata?: { [key: string]: string},
  addresses?: string[],
  labels?: Label[]
}

export class Finding {
  private constructor(
    readonly name: string,
    readonly description: string,
    readonly alertId: string,
    readonly protocol: string,
    readonly severity: FindingSeverity,
    readonly type: FindingType,
    readonly metadata: { [key: string]: string},
    readonly addresses: string[],
    readonly labels: Label[]
  ) {}

  toString() {
    return JSON.stringify({
      ...this,
      severity: FindingSeverity[this.severity],
      type: FindingType[this.type]
    }, null, 2)
  }

  static from(findingInput: FindingInput) {
    return this.fromObject(findingInput)
  }

  static fromObject({
    name,
    description,
    alertId,
    protocol = 'ethereum',
    severity,
    type,
    metadata = {},
    addresses = [],
    labels = []
  }: FindingInput) {
    assertIsNonEmptyString(name, 'name')
    assertIsNonEmptyString(description, 'description')
    assertIsNonEmptyString(alertId, 'alertId')
    assertIsNonEmptyString(protocol, 'protocol')
    assertIsFromEnum(severity, FindingSeverity, 'severity')
    assertIsFromEnum(type, FindingType, 'type')
    // TODO assert metadata keys and values are strings

    return new Finding(name, description, alertId, protocol, severity, type, metadata, addresses, labels)
  }
}