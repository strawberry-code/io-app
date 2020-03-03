import { isSome, Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { ITuple2 } from "italia-ts-commons/lib/tuples";
import { Text, View } from "native-base";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  SectionListScrollParams,
  StyleSheet
} from "react-native";
import variables from "../../theme/variables";

import startCase from "lodash/startCase";
import Placeholder from "rn-placeholder";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import { ServicesByIdState } from "../../store/reducers/entities/services/servicesById";
import { makeFontStyleObject } from "../../theme/fonts";
import customVariables from "../../theme/variables";
import { CreatedMessageWithContentAndDueDate } from "../../types/CreatedMessageWithContentAndDueDate";
import { format } from "../../utils/dates";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { EdgeBorderComponent } from "../screens/EdgeBorderComponent";
import MessageListItem from "./MessageListItem";

// Used to calculate the cell item layouts.
const LIST_HEADER_HEIGHT = 70;
const SECTION_HEADER_HEIGHT = 48;
const ITEM_HEIGHT = 158;
const FAKE_ITEM_HEIGHT = 75;
const ITEM_SEPARATOR_HEIGHT = 1;
const ITEM_WITHOUT_CTABAR_HEIGHT = 114;
const ITEM_LOADING_HEIGHT = ITEM_WITHOUT_CTABAR_HEIGHT;

const screenWidth = Dimensions.get("screen").width;

const styles = StyleSheet.create({
  // List
  emptyListWrapper: {
    padding: customVariables.contentPadding,
    alignItems: "center"
  },
  emptyListContentTitle: {
    paddingTop: customVariables.contentPadding
  },
  emptyListContentSubtitle: {
    textAlign: "center",
    fontSize: customVariables.fontSizeSmall
  },

  // ListHeader
  listHeaderWrapper: {
    height: LIST_HEADER_HEIGHT,
    paddingHorizontal: customVariables.contentPadding,
    paddingTop: 24,
    paddingBottom: 8
  },
  listHeaderButtonText: {
    ...makeFontStyleObject(Platform.select)
  },

  // SectionHeader
  sectionHeaderWrapper: {
    height: SECTION_HEADER_HEIGHT,
    paddingTop: 19,
    paddingHorizontal: customVariables.contentPadding,
    backgroundColor: customVariables.colorWhite
  },
  sectionHeaderContent: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: customVariables.brandLightGray
  },
  sectionHeaderText: {
    fontSize: 18,
    color: customVariables.brandDarkestGray,
    ...makeFontStyleObject(Platform.select, "600"),
    lineHeight: 20
  },
  sectionHeaderHighlightText: {
    fontSize: 18,
    color: customVariables.brandPrimary,
    ...makeFontStyleObject(Platform.select, "600"),
    lineHeight: 20
  },

  // Items
  itemEmptyWrapper: {
    height: FAKE_ITEM_HEIGHT,
    paddingHorizontal: customVariables.contentPadding,
    justifyContent: "center"
  },
  itemEmptyText: {
    color: customVariables.brandDarkestGray
  },
  itemSeparator: {
    height: ITEM_SEPARATOR_HEIGHT,
    backgroundColor: customVariables.brandLightGray
  },
  button: {
    alignContent: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: variables.contentPadding,
    width: screenWidth - variables.contentPadding * 2
  },
  itemLoadingContainer: {
    height: ITEM_LOADING_HEIGHT,
    paddingVertical: 16,
    paddingHorizontal: customVariables.contentPadding,
    flex: 1
  },
  itemLoadingHeaderWrapper: {
    flexDirection: "row",
    marginBottom: 4
  },
  itemLoadingHeaderCenter: {
    flex: 1,
    paddingRight: 55 // Includes right header space
  },
  itemLoadingContentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 42
  },
  itemLoadingContentCenter: {
    flex: 1,
    paddingRight: 32
  }
});

export type FakeItem = {
  fake: true;
};

export type MessageAgendaItemMetadata = {
  isRead: boolean;
};

export type MessageAgendaItem = ITuple2<
  CreatedMessageWithContentAndDueDate,
  MessageAgendaItemMetadata
>;

export type MessageAgendaSection = SectionListData<
  MessageAgendaItem | FakeItem
>;

// tslint:disable-next-line: readonly-array
export type Sections = MessageAgendaSection[];

export type ItemLayout = {
  length: number;
  offset: number;
  index: number;
};

type Props = {
  sections: Sections;
  sectionToLoad?: number;
  servicesById: ServicesByIdState;
  paymentsByRptId: PaymentByRptIdState;
  onPressItem: (id: string) => void;
  onLongPressItem: (id: string) => void;
  onMoreDataRequest: () => void;
  refreshing: boolean;
  selectedMessageIds: Option<Set<string>>;
  nextDeadlineId: Option<string>;
};

type State = {
  itemLayouts: ReadonlyArray<ItemLayout>;
  prevSections?: Sections;
  isLoadingProgress: boolean;
  isFirstLoading: boolean;
  isDeadlinesLoaded: boolean;
  isLoadingComplete: boolean;
  numMessagesToRender: number;
};

export const isFakeItem = (item: any): item is FakeItem => {
  return item.fake;
};

const keyExtractor = (_: MessageAgendaItem | FakeItem, index: number) =>
  isFakeItem(_) ? `item-${index}` : _.e1.id;

/**
 * Generate item layouts from sections.
 * The VirtualizedSectionList react-native component create cells for:
 * - SECTION_HEADER
 * - ITEM + ITEM_SEPARATOR (NOTE: A single cell for both)
 * - SECTION_FOOTER
 *
 * Here we calculate the ItemLayout for each cell.
 */
const generateItemLayouts = (sections: Sections) => {
  // tslint:disable-next-line: no-let
  let offset = LIST_HEADER_HEIGHT;
  // tslint:disable-next-line: no-let
  let index = 0;
  // tslint:disable-next-line: readonly-array
  const itemLayouts: ItemLayout[] = [];

  sections.forEach(section => {
    // Push the info about the SECTION_HEADER cell.
    itemLayouts.push({
      length: SECTION_HEADER_HEIGHT,
      offset,
      index
    });

    offset += SECTION_HEADER_HEIGHT;
    index++;

    section.data.forEach((_, dataIndex, data) => {
      const isLastItem = dataIndex === data.length - 1;

      const itemHeight = ITEM_HEIGHT;
      const cellHeight = isLastItem
        ? itemHeight
        : itemHeight + ITEM_SEPARATOR_HEIGHT;
      itemLayouts.push({
        length: cellHeight,
        offset,
        index
      });

      offset += cellHeight;
      index++;
    });

    // Push the info about the SECTION_FOOTER cell.
    // NOTE: VirtualizedSectionList component creates a cell instance for
    // the SECTION_FOOTER even when not rendered.
    itemLayouts.push({
      length: 0,
      offset,
      index
    });

    index++;
  });

  return itemLayouts;
};

const ItemSeparatorComponent = () => <View style={styles.itemSeparator} />;

const MessageItemPlaceholder = (
  <View style={[styles.itemLoadingContainer]}>
    <View style={styles.itemLoadingHeaderWrapper}>
      <View style={styles.itemLoadingHeaderCenter}>
        <Placeholder.Paragraph
          textSize={customVariables.fontSizeBase}
          color={customVariables.shineColor}
          lineNumber={2}
          lineSpacing={5}
          width="100%"
          firstLineWidth="100%"
          lastLineWidth="55%"
          animate="shine"
          onReady={false}
        />
      </View>
    </View>

    <View style={styles.itemLoadingContentWrapper}>
      <View style={styles.itemLoadingContentCenter}>
        <Placeholder.Line
          textSize={customVariables.fontSizeBase}
          color={customVariables.shineColor}
          width="75%"
          animate="shine"
        />
      </View>
    </View>
  </View>
);

const SectionHeaderPlaceholder = (
  <View style={styles.sectionHeaderWrapper}>
    <View style={styles.sectionHeaderContent}>
      <Placeholder.Line
        textSize={customVariables.fontSizeBase}
        color={customVariables.shineColor}
        width="75%"
        animate="shine"
      />
    </View>
  </View>
);
/**
 * A component to render messages with due_date in a agenda like form.
 */
class MessageAgenda extends React.PureComponent<Props, State> {
  private idTimeout?: number;
  private idInterval?: number;
  private messageToLoadFromSections: number = 0;
  // Ref to section list
  private sectionListRef = React.createRef<any>();
  constructor(props: Props) {
    super(props);
    this.state = {
      itemLayouts: [],
      isLoadingProgress: false,
      isFirstLoading: true,
      isDeadlinesLoaded: false,
      isLoadingComplete: false,
      numMessagesToRender: 0
    };
  }

  public componentDidMount() {
    // tslint:disable-next-line: no-object-mutation
    this.idInterval = setInterval(() => {
      if (!this.state.isDeadlinesLoaded) {
        this.isDeadlinesLoadingComplete();
      } else {
        clearInterval(this.idInterval);
      }
    }, 300);
  }

  public componentWillUnmount() {
    // if a timeout is running we have to stop it
    if (this.idTimeout !== undefined) {
      clearTimeout(this.idTimeout);
    }
    if (this.idInterval !== undefined) {
      clearInterval(this.idInterval);
    }
  }

  public async componentDidUpdate() {
    if (
      this.state.isDeadlinesLoaded &&
      this.sectionListRef.current !== null &&
      this.state.isFirstLoading &&
      this.props.sections !== undefined &&
      this.props.sections.length > 0
    ) {
      if (
        this.props.sections.length > 1 &&
        this.state.numMessagesToRender > 5
      ) {
        if (isSome(this.props.nextDeadlineId)) {
          const sectionIndex = this.props.sections.findIndex(this.checkSection);
          if (sectionIndex !== -1) {
            this.scrollToNextDeadline(
              sectionIndex,
              this.props.sections.length - 1
            );
          } else {
            this.completeLoadingState();
          }
        } else {
          this.completeLoadingState();
        }
      } else {
        this.completeLoadingState();
      }
    }
  }

  private scrollToNextDeadline = (
    sectionIndex: number,
    sectionsLength: number
  ) => {
    this.setState({ isFirstLoading: false });
    if (sectionIndex === sectionsLength) {
      this.completeLoadingState();
    }
    this.idTimeout = setTimeout(() => {
      // tslint:disable-next-line: no-object-mutation
      this.idTimeout = undefined;
      this.scrollToLocation({
        animated: false,
        itemIndex: 0,
        sectionIndex: Platform.select({
          ios:
            sectionIndex === sectionsLength ? sectionIndex : sectionIndex + 1,
          android:
            sectionIndex === sectionsLength ? sectionIndex - 1 : sectionIndex
        })
      });
    }, 300);
  };

  private checkSection = (s: MessageAgendaSection) => {
    const isFake = s.fake;
    const nextDeadlineId = isSome(this.props.nextDeadlineId)
      ? this.props.nextDeadlineId.value
      : undefined;
    const item = s.data[0];
    const sectionId = !isFakeItem(item) ? item.e1.id : undefined;

    return !isFake && sectionId === nextDeadlineId;
  };

  public static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State
  ): Partial<State> | null {
    const { sections } = nextProps;
    const { prevSections } = prevState;
    if (sections !== prevSections) {
      return {
        prevSections: sections,
        itemLayouts: generateItemLayouts(sections)
      };
    }

    return null;
  }

  private isDeadlinesLoadingComplete = () => {
    if (
      this.getMessageToLoadFromSections(this.props.sections) ===
        this.props.sectionToLoad &&
      !this.state.isDeadlinesLoaded
    ) {
      this.setState({
        isDeadlinesLoaded: true
      });
    }
  };

  private getMessageToLoadFromSections = (sections: Sections) => {
    // tslint:disable-next-line: no-object-mutation
    this.messageToLoadFromSections = 0;
    sections.forEach(s => {
      const messageInside = s.data.length;
      // tslint:disable-next-line: no-object-mutation
      this.messageToLoadFromSections += messageInside;
    });
    this.setState({
      numMessagesToRender:
        this.messageToLoadFromSections + this.state.numMessagesToRender
    });
    return this.messageToLoadFromSections;
  };

  private completeLoadingState = () => {
    if (this.state.isFirstLoading) {
      this.setState({
        isFirstLoading: false,
        isLoadingComplete: true
      });
    } else {
      this.setState({
        isLoadingComplete: true
      });
    }
  };

  private renderSectionHeader = (info: { section: MessageAgendaSection }) => {
    const nextDeadlineId = isSome(this.props.nextDeadlineId)
      ? this.props.nextDeadlineId.value
      : undefined;

    const item = info.section.data[0];
    const sectionId = !isFakeItem(item) ? item.e1.id : undefined;

    if (isFakeItem(item)) {
      return;
    }

    if (!this.state.isLoadingComplete) {
      return SectionHeaderPlaceholder;
    }

    return (
      <View style={styles.sectionHeaderWrapper}>
        <View style={styles.sectionHeaderContent}>
          <Text
            style={
              sectionId === nextDeadlineId
                ? styles.sectionHeaderHighlightText
                : styles.sectionHeaderText
            }
          >
            {startCase(
              format(
                info.section.title,
                I18n.t("global.dateFormats.weekdayDayMonthYear")
              )
            )}
          </Text>
        </View>
      </View>
    );
  };

  private renderItem: SectionListRenderItem<
    MessageAgendaItem | FakeItem
  > = info => {
    if (isFakeItem(info.item)) {
      return;
    }

    const message = info.item.e1;
    const { isRead } = info.item.e2;
    const {
      paymentsByRptId,
      onPressItem,
      onLongPressItem,
      selectedMessageIds
    } = this.props;

    const potService = this.props.servicesById[message.sender_service_id];

    if (!this.state.isLoadingComplete) {
      return MessageItemPlaceholder;
    }

    const service =
      potService !== undefined
        ? pot.isNone(potService)
          ? ({
              organization_name: I18n.t("messages.errorLoading.senderInfo"),
              department_name: I18n.t("messages.errorLoading.serviceInfo")
            } as ServicePublic)
          : pot.toUndefined(potService)
        : undefined;

    const payment =
      message.content.payment_data !== undefined && service !== undefined
        ? paymentsByRptId[
            `${service.organization_fiscal_code}${
              message.content.payment_data.notice_number
            }`
          ]
        : undefined;

    return (
      <MessageListItem
        isRead={isRead}
        message={message}
        service={service}
        payment={payment}
        onPress={onPressItem}
        onLongPress={onLongPressItem}
        isSelectionModeEnabled={selectedMessageIds.isSome()}
        isSelected={selectedMessageIds
          .map(_ => _.has(message.id))
          .getOrElse(false)}
      />
    );
  };

  private getItemLayout = (_: Sections | null, index: number) => {
    return this.state.itemLayouts[index];
  };

  private ListEmptyComponent = (
    <View style={styles.emptyListWrapper}>
      <ButtonDefaultOpacity
        block={true}
        primary={true}
        small={true}
        bordered={true}
        style={styles.button}
      >
        <Text numberOfLines={1}>{I18n.t("reminders.loadMoreData")}</Text>
      </ButtonDefaultOpacity>
      <View spacer={true} />
      <Image
        source={require("../../../img/messages/empty-due-date-list-icon.png")}
      />
      <Text style={styles.emptyListContentTitle}>
        {I18n.t("messages.deadlines.emptyMessage.title")}
      </Text>
      <Text style={styles.emptyListContentSubtitle}>
        {I18n.t("messages.deadlines.emptyMessage.subtitle")}
      </Text>
    </View>
  );

  // Show this component when the user has not deadlines
  private ListEmptySectionsComponent = (
    <View style={styles.emptyListWrapper}>
      <View spacer={true} large={true} />
      <Image
        source={require("../../../img/messages/empty-due-date-list-icon.png")}
      />
      <Text style={styles.emptyListContentTitle}>
        {I18n.t("messages.deadlines.emptyMessage.title")}
      </Text>
    </View>
  );

  public render() {
    const {
      sections,
      servicesById,
      paymentsByRptId,
      refreshing,
      onMoreDataRequest
    } = this.props;

    const refreshControl = (
      <RefreshControl
        refreshing={refreshing || !this.state.isDeadlinesLoaded}
        onRefresh={onMoreDataRequest}
      />
    );

    return (
      <View
        style={{
          flex: 1,
          width: screenWidth
        }}
      >
        <SectionList
          // If we not have a final deadline then we not have deadlines
          sections={sections}
          extraData={{ servicesById, paymentsByRptId }}
          initialNumToRender={this.state.numMessagesToRender}
          bounces={true}
          scrollEnabled={true}
          refreshControl={refreshControl}
          keyExtractor={keyExtractor}
          ref={this.sectionListRef}
          onScroll={() => {
            if (!this.state.isLoadingComplete && !this.state.isFirstLoading) {
              this.completeLoadingState();
            }
          }}
          scrollEventThrottle={8}
          renderItem={this.renderItem}
          renderSectionHeader={this.renderSectionHeader}
          ItemSeparatorComponent={ItemSeparatorComponent}
          getItemLayout={this.getItemLayout}
          ListHeaderComponent={false}
          ListFooterComponent={sections.length > 0 && <EdgeBorderComponent />}
          ListEmptyComponent={
            sections.length === 0
              ? this.ListEmptySectionsComponent
              : this.ListEmptyComponent
          }
        />
      </View>
    );
  }

  public scrollToLocation = (params: SectionListScrollParams) => {
    if (this.sectionListRef.current !== null) {
      this.sectionListRef.current.scrollToLocation(params);
    }
  };
}

export default MessageAgenda;
