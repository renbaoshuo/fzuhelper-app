import { useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListRow,
  DescriptionListTerm,
} from '@/components/DescriptionList';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';

interface ScheduleItemProps {
  schedule: {
    name: string;
    location: string;
    teacher: string;
    startClass: number;
    endClass: number;
    startWeek: number;
    endWeek: number;
    remark?: string;
    syllabus: string;
    lessonplan: string;
  };
  height: number;
  span: number;
  onSyllabusPress: (syllabus: string) => void; // 教学大纲点击事件
  onLessonPlanPress: (lessonPlan: string) => void; // 授课计划点击事件
}

const ScheduleItem: React.FC<ScheduleItemProps> = ({ schedule, height, span, onSyllabusPress, onLessonPlanPress }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {/* 课程表中的一个课程，我们将每个课程作为打开课程详情的按钮 */}
      <DialogTrigger asChild>
        <Pressable
          className="flex min-h-14 flex-shrink-0 flex-grow-0 basis-0 flex-col items-center justify-center rounded-lg border border-gray-200 p-[1px]"
          style={{
            flexGrow: span,
            height: (span / 11) * height,
          }}
        >
          <Text className="truncate text-wrap break-all text-center text-[11px] text-gray-500">{schedule.name}</Text>
          <Text className="text-wrap break-all text-[11px] text-gray-500">{schedule.location}</Text>
        </Pressable>
      </DialogTrigger>

      {/* 点击课程后弹出的 Dialog 内容 */}
      <DialogContent className="flex w-[90vw] flex-col justify-center pb-6 pt-10 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-primary">{schedule.name}</DialogTitle>
        </DialogHeader>

        <DescriptionList className="mx-6 mb-1 mt-4">
          <DescriptionListRow>
            <DescriptionListTerm>
              <Text>教室</Text>
            </DescriptionListTerm>
            <DescriptionListDescription>
              <Text>{schedule.location}</Text>
            </DescriptionListDescription>
          </DescriptionListRow>
          <DescriptionListRow>
            <DescriptionListTerm>
              <Text>教师</Text>
            </DescriptionListTerm>
            <DescriptionListDescription>
              <Text>{schedule.teacher}</Text>
            </DescriptionListDescription>
          </DescriptionListRow>
          <DescriptionListRow>
            <DescriptionListTerm>
              <Text>节数</Text>
            </DescriptionListTerm>
            <DescriptionListDescription>
              <Text>
                {schedule.startClass}-{schedule.endClass} 节
              </Text>
            </DescriptionListDescription>
          </DescriptionListRow>
          <DescriptionListRow>
            <DescriptionListTerm>
              <Text>周数</Text>
            </DescriptionListTerm>
            <DescriptionListDescription>
              <Text>
                {schedule.startWeek}-{schedule.endWeek} 周
              </Text>
            </DescriptionListDescription>
          </DescriptionListRow>
          <DescriptionListRow>
            <DescriptionListTerm>
              <Text>备注</Text>
            </DescriptionListTerm>
            <DescriptionListDescription>
              <Text>{schedule.remark}</Text>
            </DescriptionListDescription>
          </DescriptionListRow>
        </DescriptionList>

        <View className="flex flex-row justify-evenly">
          <Button
            variant="link"
            onPress={() => {
              setIsDialogOpen(false);
              onSyllabusPress(schedule.syllabus);
            }}
          >
            <Text className="text-primary">教学大纲</Text>
          </Button>
          <Button
            variant="link"
            onPress={() => {
              setIsDialogOpen(false);
              onLessonPlanPress(schedule.lessonplan);
            }}
          >
            <Text className="text-primary">授课计划</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleItem;
