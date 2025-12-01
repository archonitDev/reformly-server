import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class NotificationSettingsDto {
    @ApiProperty({
        description: 'Exercise reminders',
    })
    @IsBoolean()
    @IsNotEmpty()
    exerciseRemindersNotifications: boolean;

    @ApiProperty({
        description: 'Likes',
    })
    @IsBoolean()
    @IsNotEmpty()
    likesNotifications: boolean;

    @ApiProperty({
        description: 'Comments likes',
    })
    @IsBoolean()
    @IsNotEmpty()
    commentsNotifications: boolean;
}