import "dayjs/locale/de";
import "dayjs/locale/en";

import { Group, Indicator, Paper, useMantineTheme } from "@mantine/core";

import { DatePicker } from "@mantine/dates";
import { Locale } from "~/types";
import { useRouter } from "next/router";

interface PostsDatePickerProps {
  postDays: number[];
  selectedDate: Date | null;
  handleSelectDate: (date: Date | null) => void;
  dateOfnewestPost: Date;
  dateOfGermination: Date;
  getResponsiveColumnCount: number;
}

const PostsDatePicker: React.FC<PostsDatePickerProps> = ({
  postDays,
  selectedDate,
  handleSelectDate,
  dateOfnewestPost,
  dateOfGermination,
  getResponsiveColumnCount,
}) => {
  const theme = useMantineTheme();
  const router = useRouter();

  return (
    <Paper withBorder>
      <Group position="center">
        <DatePicker
          locale={router.locale === Locale.DE ? Locale.DE : Locale.EN}
          size="md"
          renderDay={(date) => {
            const day = date.getDate();
            const calDay = date.getTime();
            const isDisabled = !postDays.includes(calDay);

            return (
              <Indicator
                className="z-20"
                disabled={isDisabled}
                size={10}
                color={theme.colors.green[8]}
                offset={-2}
              >
                <div>{day}</div>
              </Indicator>
            );
          }}
          defaultDate={selectedDate as Date}
          value={selectedDate}
          onChange={handleSelectDate}
          maxDate={dateOfnewestPost}
          minDate={dateOfGermination}
          numberOfColumns={getResponsiveColumnCount}
          maxLevel="month"
        />
      </Group>
    </Paper>
  );
};

export default PostsDatePicker;
