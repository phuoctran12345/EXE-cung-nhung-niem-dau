export class CreateEventDto {
  readonly title: string;
  readonly description?: string;
  readonly date: Date;
  readonly location: string;
  readonly price: number;
}
